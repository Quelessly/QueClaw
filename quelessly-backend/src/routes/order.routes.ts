import { Router } from 'express'
import * as orderController from '../controllers/order.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Public — student routes
router.post('/', orderController.placeOrder)
router.get('/:orderId', orderController.getOrder)

// Vendor routes
router.get('/', authenticate, orderController.getVendorOrders)
router.patch('/:orderId/status', authenticate, orderController.updateOrderStatus)

export default router