import { Router } from 'express'
import * as paymentController from '../controllers/payment.controller'

const router = Router()

router.post('/initiate', paymentController.initiatePayment)
router.post('/verify', paymentController.verifyPayment)
// Webhook removed: with per-vendor keys there is no single webhook secret to
// verify against, and /verify is the confirmation path. If ever needed again,
// store a per-vendor webhook secret alongside the keys.

export default router