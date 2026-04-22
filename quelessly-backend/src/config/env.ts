import dotenv from 'dotenv'
dotenv.config()

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Razorpay (keep for rollback)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID!,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET!,

  // Cashfree
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID!,
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY!,
  CASHFREE_WEBHOOK_SECRET: process.env.CASHFREE_WEBHOOK_SECRET!,
  CASHFREE_ENV: (process.env.CASHFREE_ENV || 'sandbox') as 'sandbox' | 'production',

  PORT: process.env.PORT || 4000,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  ADMIN_SECRET: process.env.ADMIN_SECRET!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  SENTRY_DSN: process.env.SENTRY_DSN,
}

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CASHFREE_APP_ID',
  'CASHFREE_SECRET_KEY',
  'CASHFREE_WEBHOOK_SECRET',
  'FRONTEND_URL',
  'ADMIN_SECRET',
  'RESEND_API_KEY',
]
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`)
})