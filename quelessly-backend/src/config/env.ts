import dotenv from 'dotenv'
dotenv.config()

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID!,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,
  PORT: process.env.PORT || 4000,
}

const required = ['DATABASE_URL', 'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`)
})