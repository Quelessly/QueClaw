import * as paymentRepo from '../repositories/payment.repository'
import * as orderRepo from '../repositories/order.repository'
import { createRazorpayOrder, verifyPaymentSignature } from './razorpay.service'
import { decrypt } from '../utils/encryption'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { getIO } from '../config/socket'

export const initiatePayment = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { vendor: true },
  })
  if (!order) throw new Error('Order not found')
  if (order.payment_status === PaymentStatus.captured) throw new Error('Order already paid')
  if (new Date() > order.expires_at) throw new Error('Order has expired')

  if (!order.vendor.razorpay_key_id || !order.vendor.razorpay_key_secret) {
    throw new Error('This canteen has not set up payments yet. Please pay at the counter.')
  }

  // Decrypt in-memory only, at payment time
  const keySecret = decrypt(order.vendor.razorpay_key_secret)

  const existing = await paymentRepo.getPaymentByOrderId(orderId)
  if (existing && existing.status === PaymentStatus.captured) throw new Error('Already paid')

  const rzpOrder = await createRazorpayOrder(
    Number(order.total_amount),
    orderId,
    order.vendor.razorpay_key_id,
    keySecret
  )

  if (existing) {
    // BUGFIX: on retry, the old code created a fresh Razorpay order but kept
    // the stale razorpay_order_id in the DB — verification then failed with
    // "Payment record not found" even after the student paid.
    await prisma.payment.update({
      where: { id: existing.id },
      data: { razorpay_order_id: rzpOrder.id, status: PaymentStatus.pending },
    })
  } else {
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
    razorpayKeyId: order.vendor.razorpay_key_id, // public, safe to return
  }
}

export const verifyAndCapture = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { razorpay_order_id },
    include: { order: { include: { vendor: true } } },
  })
  if (!payment) throw new Error('Payment record not found')

  // Fast path — already captured (idempotent success for client retries)
  if (payment.status === PaymentStatus.captured) {
    return { success: true, order_id: payment.order_id }
  }

  if (!payment.order.vendor.razorpay_key_secret) {
    throw new Error('Vendor payment configuration missing')
  }
  const keySecret = decrypt(payment.order.vendor.razorpay_key_secret)

  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    keySecret
  )
  if (!isValid) throw new Error('Invalid payment signature')

  // Race-safe capture: atomically claim the pending payment. If two verify
  // calls arrive simultaneously, only one gets claim.count === 1 — the other
  // skips the order update and the socket emits (no duplicate "new order").
  const claimed = await prisma.$transaction(async (tx) => {
    const claim = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: PaymentStatus.captured } },
      data: {
        razorpay_payment_id,
        razorpay_signature,
        status: PaymentStatus.captured,
        method: 'razorpay',
      },
    })
    if (claim.count === 0) return false

    await tx.order.update({
      where: { id: payment.order_id },
      data: { payment_status: PaymentStatus.captured, status: OrderStatus.paid },
    })
    return true
  })

  if (claimed) {
    try {
      const io = getIO()
      const fullOrder = await orderRepo.getOrderById(payment.order_id)
      io.to(`vendor_${payment.order.vendor_id}`).emit('new_order', fullOrder)
      io.to(`order_${payment.order_id}`).emit('payment_success', {
        order_id: payment.order_id,
      })
    } catch {
      // Socket not critical
    }
  }

  return { success: true, order_id: payment.order_id }
}