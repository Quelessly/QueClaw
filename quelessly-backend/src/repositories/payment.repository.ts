import { prisma } from '../config/prisma'
import { PaymentStatus } from '@prisma/client'

export const createPayment = (data: {
  order_id: string
  razorpay_order_id: string
  amount: number
}) =>
  prisma.payment.create({ data })

export const getPaymentByOrderId = (order_id: string) =>
  prisma.payment.findUnique({ where: { order_id } })

export const getPaymentByRazorpayOrderId = (razorpay_order_id: string) =>
  prisma.payment.findUnique({ where: { razorpay_order_id } })

export const updatePaymentSuccess = (
  id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  method: string
) =>
  prisma.payment.update({
    where: { id },
    data: {
      razorpay_payment_id,
      razorpay_signature,
      status: PaymentStatus.captured,
      method,
    },
  })

export const updatePaymentFailed = (id: string, failure_reason: string) =>
  prisma.payment.update({
    where: { id },
    data: {
      status: PaymentStatus.failed,
      failure_reason,
    },
  })