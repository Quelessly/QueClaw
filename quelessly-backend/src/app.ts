import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.routes'
import menuRoutes from './routes/menu.routes'
import orderRoutes from './routes/order.routes'
import paymentRoutes from './routes/payment.routes'
import adminRoutes from './routes/admin.routes'

const app = express()

app.set('trust proxy', 1) // ✅ Trust Railway's proxy to get real client IPs

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://quelessly.com',
    'https://www.quelessly.com',
    'https://que-claw.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
}))

// ✅ Webhook must get raw body before any other middleware
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())

// ✅ Strict rate limit for auth — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ✅ General rate limit for public routes — 60 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/v1/auth/login', authLimiter)
app.use('/api/v1/orders', generalLimiter)
app.use('/api/v1/payments/initiate', generalLimiter)
app.use('/api/v1/menu/public', generalLimiter)

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/menu', menuRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/admin', adminRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.get('/api/v1/health', (_, res) => res.json({ status: 'ok' }))

export default app