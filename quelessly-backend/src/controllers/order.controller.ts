import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as orderService from '../services/order.service'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { OrderStatus } from '@prisma/client'

export const placeOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { vendor_id, items } = req.body
    const order = await orderService.placeOrder(vendor_id, items)
    sendSuccess(res, order, 201)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrder(req.params.orderId as string)
    sendSuccess(res, order)
  } catch (err: any) {
    sendError(res, err.message, 404)
  }
}

export const getVendorOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1
    const orders = await orderService.getVendorOrders(req.vendorId!, page)
    sendSuccess(res, orders)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body
    const order = await orderService.changeOrderStatus(
      req.vendorId!,
      req.params.orderId as string,
      status as OrderStatus
    )
    sendSuccess(res, order)
  } catch (err: any) {
    sendError(res, err.message)
  }
}