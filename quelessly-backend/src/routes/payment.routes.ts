import { Router } from 'express'
import * as paymentController from '../controllers/payment.controller'

const router = Router()

router.post('/initiate', paymentController.initiatePayment)
router.post('/verify', paymentController.verifyPayment)
router.post('/webhook', paymentController.handleWebhook)

export default router