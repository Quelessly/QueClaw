import * as paymentRepo from '../repositories/payment.repository'
import * as orderRepo from '../repositories/order.repository'
import { createCashfreeOrder, fetchCashfreeOrder } from './cashfree.service'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { getIO } from '../config/socket'

// ─── Initiate payment — creates Cashfree order, returns session_id to frontend ─
export const initiatePayment = async (orderId: string) => {
  const order = await orderRepo.getOrderById(orderId)
  if (!order) throw new Error('Order not found')
  if (order.payment_status === PaymentStatus.captured)
    throw new Error('Order already paid')
  if (new Date() > order.expires_at)
    throw new Error('Order has expired')

  const existing = await paymentRepo.getPaymentByOrderId(orderId)
  if (existing && existing.status === PaymentStatus.captured)
    throw new Error('Already paid')

  const cfOrder = await createCashfreeOrder(Number(order.total_amount), orderId)

  if (!existing) {
    await paymentRepo.createPayment({
      order_id: orderId,
      razorpay_order_id: cfOrder.cf_order_id,   // reusing column for cf_order_id
      amount: Number(order.total_amount),
    })
  }

  return {
    payment_session_id: cfOrder.payment_session_id,
    cf_order_id: cfOrder.cf_order_id,
    amount: Number(order.total_amount),
    order_id: orderId,
  }
}

// ─── Verify and capture — called after frontend gets success callback ─────────
// For Cashfree we confirm by fetching order status from their API (server-side).
// There is no client-side signature to verify unlike Razorpay — the source of
// truth is always the Cashfree order status endpoint.
export const verifyAndCapture = async (
  cf_order_id: string,
  cf_payment_id: string   // passed from frontend for record-keeping
) => {
  // Always verify with Cashfree API — never trust client-side data
  const cfOrder = await fetchCashfreeOrder(cf_order_id)
  if (cfOrder.order_status !== 'PAID') {
    throw new Error(`Payment not confirmed. Status: ${cfOrder.order_status}`)
  }

  const payment = await paymentRepo.getPaymentByRazorpayOrderId(cf_order_id)
  if (!payment) throw new Error('Payment record not found')

  // ✅ Idempotency guard — already captured, skip everything
  if (payment.status === PaymentStatus.captured) {
    return { success: true, order_id: payment.order_id }
  }

  const order = await orderRepo.getOrderById(payment.order_id)

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpay_payment_id: cf_payment_id,   // reusing column for cf_payment_id
        status: PaymentStatus.captured,
        method: 'cashfree',
      },
    }),
    prisma.order.update({
      where: { id: payment.order_id },
      data: {
        payment_status: PaymentStatus.captured,
        status: OrderStatus.paid,
      },
    }),
  ])

  try {
    const io = getIO()
    const fullOrder = await orderRepo.getOrderById(payment.order_id)
    io.to(`vendor_${order?.vendor_id}`).emit('new_order', fullOrder)
    io.to(`order_${payment.order_id}`).emit('payment_success', {
      order_id: payment.order_id,
    })
  } catch (e) {
    // Socket not critical
  }

  return { success: true, order_id: payment.order_id }
}