import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'

const router = Router()

router.post('/invite-vendor', adminController.inviteVendor)
router.post('/verify-vendor', adminController.verifyVendor)

export default router