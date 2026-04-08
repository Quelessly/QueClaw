import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import menuRoutes from './routes/menu.routes'
import orderRoutes from './routes/order.routes'
import paymentRoutes from './routes/payment.routes'

const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/menu', menuRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

export default app