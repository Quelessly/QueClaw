import express from 'express'
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
  ],
  credentials: true,
}))
app.use(express.json())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/menu', menuRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/admin', adminRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

export default app