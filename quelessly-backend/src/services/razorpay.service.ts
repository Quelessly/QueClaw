import Razorpay from 'razorpay'
import crypto from 'crypto'
import { env } from '../config/env'

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

export const createRazorpayOrder = async (amount: number, orderId: string) => {
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: orderId,
  })
}

export const verifyPaymentSignature = (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): boolean => {
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  return expected === razorpay_signature
}

export const verifyWebhookSignature = (
  rawBody: string,
  signature: string
): boolean => {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)  // ← separate secret now
    .update(rawBody)
    .digest('hex')
  return expected === signature
}