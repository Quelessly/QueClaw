import { Router } from 'express'
import * as menuController from '../controllers/menu.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Public route — students scan QR and see this
router.get('/public/:vendorId', menuController.getPublicMenu)

// Protected routes — vendor dashboard
router.get('/', authenticate, menuController.getVendorMenu)
router.post('/', authenticate, menuController.addMenuItem)
router.patch('/:itemId', authenticate, menuController.editMenuItem)
router.delete('/:itemId', authenticate, menuController.removeMenuItem)

export default router