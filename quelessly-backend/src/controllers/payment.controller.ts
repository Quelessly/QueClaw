import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as paymentService from '../services/payment.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

const initiateSchema = z.object({
  order_id: z.string().uuid('Invalid order id'),
})

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().regex(/^[0-9a-f]{64}$/i, 'Invalid signature format'),
})

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = initiateSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400)
    const data = await paymentService.initiatePayment(parsed.data.order_id)
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = verifySchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400)
    const result = await paymentService.verifyAndCapture(
      parsed.data.razorpay_order_id,
      parsed.data.razorpay_payment_id,
      parsed.data.razorpay_signature
    )
    sendSuccess(res, result)
  } catch (err: any) {
    sendError(res, err.message, 400)
  }
}