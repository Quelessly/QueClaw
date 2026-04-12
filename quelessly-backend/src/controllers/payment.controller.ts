import { Request, Response, NextFunction } from 'express'
import * as paymentService from '../services/payment.service'
import { verifyWebhookSignature } from '../services/razorpay.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_id } = req.body
    const data = await paymentService.initiatePayment(order_id)
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const result = await paymentService.verifyAndCapture(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )
    sendSuccess(res, result)
  } catch (err: any) {
    sendError(res, err.message, 400)
  }
}

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string

    // ✅ req.body is a raw Buffer because of express.raw() in app.ts
    const rawBody = req.body as Buffer
    const rawBodyString = rawBody.toString('utf8')

    const isValid = verifyWebhookSignature(rawBodyString, signature)
    if (!isValid) return sendError(res, 'Invalid webhook signature', 400)

    // ✅ Respond immediately — Razorpay retries if no 200 within 5s
    res.json({ received: true })

    // ✅ Parse manually after verification
    const payload = JSON.parse(rawBodyString)
    const event = payload.event
    const paymentEntity = payload.payload?.payment?.entity

    if (event === 'payment.captured' && paymentEntity) {
      const paymentSignature = paymentEntity.razorpay_signature ?? paymentEntity.signature
      if (paymentSignature) {
        await paymentService.verifyAndCapture(
          paymentEntity.order_id,
          paymentEntity.id,
          paymentSignature
        )
      }
    }
  } catch (err: any) {
    console.error('Webhook processing error:', err.message)
  }
}