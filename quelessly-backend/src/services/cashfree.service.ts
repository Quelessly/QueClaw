import crypto from 'crypto'
import { env } from '../config/env'

const BASE_URL =
  env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'

const CF_API_VERSION = '2023-08-01'

const cfHeaders = {
  'Content-Type': 'application/json',
  'x-api-version': CF_API_VERSION,
  'x-client-id': env.CASHFREE_APP_ID,
  'x-client-secret': env.CASHFREE_SECRET_KEY,
}

// ─── Create a Cashfree order, returns order_id + payment_session_id ───────────
export const createCashfreeOrder = async (
  amount: number,
  orderId: string,
  customerPhone = '9999999999'
) => {
  const body = {
    order_id: `ql_${orderId.replace(/-/g, '').slice(0, 20)}`, // max 50 chars, no hyphens
    order_amount: Number(amount.toFixed(2)),
    order_currency: 'INR',
    customer_details: {
      customer_id: orderId,           // reuse our order UUID as customer_id
      customer_phone: customerPhone,  // Cashfree requires a phone number
    },
    order_meta: {
      return_url: `${env.FRONTEND_URL}/order/${orderId}?cf_order_id={order_id}`,
    },
  }

  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: cfHeaders,
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create Cashfree order')

  return {
    cf_order_id: data.order_id as string,           // e.g. "ql_abc123..."
    payment_session_id: data.payment_session_id as string,
    order_status: data.order_status as string,
  }
}

// ─── Fetch order status from Cashfree to confirm payment ─────────────────────
export const fetchCashfreeOrder = async (cf_order_id: string) => {
  const res = await fetch(`${BASE_URL}/orders/${cf_order_id}`, {
    method: 'GET',
    headers: cfHeaders,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch Cashfree order')
  return data as {
    order_id: string
    order_status: 'ACTIVE' | 'PAID' | 'EXPIRED'
    order_amount: number
    cf_order_id: string
  }
}

// ─── Verify Cashfree webhook signature ───────────────────────────────────────
// Cashfree signs webhooks with HMAC-SHA256 using the webhook secret key.
// Header: x-webhook-signature
// The signature is: HMAC-SHA256(timestamp + rawBody, webhookSecret), base64 encoded
export const verifyCashfreeWebhook = (
  rawBody: string,
  signature: string,
  timestamp: string
): boolean => {
  const data = timestamp + rawBody
  const expected = crypto
    .createHmac('sha256', env.CASHFREE_WEBHOOK_SECRET)
    .update(data)
    .digest('base64')
  return expected === signature
}