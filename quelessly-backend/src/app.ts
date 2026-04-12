import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import menuRoutes from './routes/menu.routes'
import orderRoutes from './routes/order.routes'
import paymentRoutes from './routes/payment.routes'
import adminRoutes from './routes/admin.routes'

const app = express()

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

// ✅ Webhook route must receive raw body BEFORE express.json() parses it
// Capture raw buffer and attach to req, then parse as JSON for the handler
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))

// All other routes use normal JSON parsing
app.use(express.json())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/menu', menuRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/admin', adminRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.get('/api/v1/health', (_, res) => res.json({ status: 'ok' }))

export default app