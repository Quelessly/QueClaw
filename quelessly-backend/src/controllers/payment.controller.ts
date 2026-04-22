import { Request, Response, NextFunction } from 'express'
import * as paymentService from '../services/payment.service'
import { verifyCashfreeWebhook } from '../services/cashfree.service'
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

// Called by frontend after Cashfree checkout completes successfully
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cf_order_id, cf_payment_id } = req.body
    const result = await paymentService.verifyAndCapture(cf_order_id, cf_payment_id)
    sendSuccess(res, result)
  } catch (err: any) {
    sendError(res, err.message, 400)
  }
}

// Cashfree webhook — safety net in case frontend verify call fails
// Cashfree sends: x-webhook-signature and x-webhook-timestamp headers
// Body is JSON (not raw buffer) but we still need raw for HMAC — keep express.raw() in app.ts
export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string
    const timestamp = req.headers['x-webhook-timestamp'] as string

    // req.body is raw Buffer because of express.raw() in app.ts
    const rawBody = (req.body as Buffer).toString('utf8')

    const isValid = verifyCashfreeWebhook(rawBody, signature, timestamp)
    if (!isValid) return sendError(res, 'Invalid webhook signature', 400)

    // ✅ Respond immediately — Cashfree retries if no 200 within 5s
    res.json({ received: true })

    const payload = JSON.parse(rawBody)
    const event = payload.type  // Cashfree uses "type" not "event"

    // Cashfree webhook event for successful payment
    if (event === 'PAYMENT_SUCCESS_WEBHOOK') {
      const paymentData = payload.data?.payment
      const orderData = payload.data?.order

      if (paymentData && orderData) {
        await paymentService.verifyAndCapture(
          orderData.order_id,
          paymentData.cf_payment_id?.toString() ?? ''
        )
      }
    }
  } catch (err: any) {
    console.error('Webhook processing error:', err.message)
  }
}