import dotenv from 'dotenv'
dotenv.config()

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID!,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET!,
  PORT: process.env.PORT || 4000,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  ADMIN_SECRET: process.env.ADMIN_SECRET!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
}

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'FRONTEND_URL',
  'ADMIN_SECRET',
  'RESEND_API_KEY',
]
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`)
})