import { Request, Response, NextFunction } from 'express'
import * as paymentService from '../services/payment.service'
import { verifyWebhookSignature } from '../services/razorpay.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

// Student initiates payment
export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_id } = req.body
    const data = await paymentService.initiatePayment(order_id)
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

// Frontend calls this after Razorpay success
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

// Razorpay webhook
export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string
    const rawBody = JSON.stringify(req.body)

    const isValid = verifyWebhookSignature(rawBody, signature)
    if (!isValid) return sendError(res, 'Invalid webhook signature', 400)

    const event = req.body.event
    const paymentEntity = req.body.payload?.payment?.entity

    if (event === 'payment.captured') {
      await paymentService.verifyAndCapture(
        paymentEntity.order_id,
        paymentEntity.id,
        req.headers['x-razorpay-signature'] as string
      )
    }

    res.json({ received: true })
  } catch (err: any) {
    sendError(res, err.message)
  }
}