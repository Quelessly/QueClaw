import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.post('/login', authController.login)
router.post('/forgot-password', authController.requestPasswordReset)
router.post('/reset-password', authController.resetPassword)
router.patch('/profile', authenticate, authController.updateProfile)
router.get('/vendor/:vendorId', authController.getVendorPublic)

// Vendor Razorpay keys (rate-limited in app.ts)
router.patch('/razorpay-keys', authenticate, authController.updateRazorpayKeys)
router.get('/razorpay-keys/status', authenticate, authController.getRazorpayKeyStatus)

export default router