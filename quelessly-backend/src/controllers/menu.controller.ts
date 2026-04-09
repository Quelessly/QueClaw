import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as menuService from '../services/menu.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const getPublicMenu = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.vendorId as string
    const items = await menuService.getPublicMenu(vendorId)
    sendSuccess(res, items)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

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
    const itemId = req.params.itemId as string
    const item = await menuService.editMenuItem(req.vendorId!, itemId, req.body)
    sendSuccess(res, item)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const removeMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.itemId as string
    await menuService.removeMenuItem(req.vendorId!, itemId)
    sendSuccess(res, { message: 'Item deleted' })
  } catch (err: any) {
    sendError(res, err.message)
  }
}