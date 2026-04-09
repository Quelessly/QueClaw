import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'

const router = Router()

router.post('/invite-vendor', adminController.inviteVendor)
router.post('/verify-vendor', adminController.verifyVendor)
router.get('/settlements', adminController.getSettlements)
router.post('/settlements/mark-settled', adminController.markSettled)
router.patch('/vendors/:vendorId/upi', adminController.updateVendorUpi)

export default router