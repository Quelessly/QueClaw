import Razorpay from 'razorpay'
import crypto from 'crypto'

// No global Razorpay instance — instantiated per vendor per request
const getVendorRazorpayInstance = (keyId: string, keySecret: string): Razorpay =>
  new Razorpay({ key_id: keyId, key_secret: keySecret })

export const createRazorpayOrder = async (
  amount: number, // in rupees
  orderId: string,
  keyId: string,
  keySecret: string
) => {
  const razorpay = getVendorRazorpayInstance(keyId, keySecret)
  return razorpay.orders.create({
    amount: Math.round(amount * 100), // paise — Math.round guards float drift
    currency: 'INR',
    receipt: orderId,
  })
}

export const verifyPaymentSignature = (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  keySecret: string // vendor's own key secret
): boolean => {
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expected = crypto.createHmac('sha256', keySecret).update(body).digest('hex')

  // Constant-time comparison — prevents timing attacks on signature guessing
  try {
    const expectedBuf = Buffer.from(expected, 'hex')
    const receivedBuf = Buffer.from(razorpay_signature, 'hex')
    if (expectedBuf.length !== receivedBuf.length) return false
    return crypto.timingSafeEqual(expectedBuf, receivedBuf)
  } catch {
    return false // non-hex or malformed signature
  }
}