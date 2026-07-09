import dotenv from 'dotenv'
dotenv.config()

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
  PORT: Number(process.env.PORT) || 4000,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  ADMIN_SECRET: process.env.ADMIN_SECRET!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  SENTRY_DSN: process.env.SENTRY_DSN, // optional — no ! so server starts without it
}

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'FRONTEND_URL',
  'ADMIN_SECRET',
  'RESEND_API_KEY',
]
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`)
})

// ENCRYPTION_KEY must be exactly 32 bytes (64 hex chars) for AES-256-GCM
if (!/^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_KEY!)) {
  throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
}