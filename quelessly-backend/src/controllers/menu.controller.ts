import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as menuService from '../services/menu.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

// Public — no auth needed
export const getPublicMenu = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { vendorId } = req.params
    const items = await menuService.getPublicMenu(vendorId)
    sendSuccess(res, items)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

// Vendor dashboard — auth required
export const getVendorMenu = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await menuService.getVendorMenu(req.vendorId!)
    sendSuccess(res, items)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const addMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await menuService.addMenuItem(req.vendorId!, req.body)
    sendSuccess(res, item, 201)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const editMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await menuService.editMenuItem(req.vendorId!, req.params.itemId, req.body)
    sendSuccess(res, item)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const removeMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await menuService.removeMenuItem(req.vendorId!, req.params.itemId)
    sendSuccess(res, { message: 'Item deleted' })
  } catch (err: any) {
    sendError(res, err.message)
  }
}