import * as paymentRepo from '../repositories/payment.repository'
import * as orderRepo from '../repositories/order.repository'
import { createRazorpayOrder, verifyPaymentSignature } from './razorpay.service'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { getIO } from '../config/socket'

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

  const rzpOrder = await createRazorpayOrder(
    Number(order.total_amount),
    orderId
  )

  if (!existing) {
    await paymentRepo.createPayment({
      order_id: orderId,
      razorpay_order_id: rzpOrder.id,
      amount: Number(order.total_amount),
    })
  }

  return {
    razorpay_order_id: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    order_id: orderId,
  }
}

export const verifyAndCapture = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  )
  if (!isValid) throw new Error('Invalid payment signature')

  const payment = await paymentRepo.getPaymentByRazorpayOrderId(razorpay_order_id)
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
        razorpay_payment_id,
        razorpay_signature,
        status: PaymentStatus.captured,
        method: 'razorpay',
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