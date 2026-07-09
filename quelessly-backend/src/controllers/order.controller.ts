import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as orderService from '../services/order.service'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { OrderStatus } from '@prisma/client'

const placeOrderSchema = z.object({
  vendor_id: z.string().uuid('Invalid vendor id'),
  items: z
    .array(
      z.object({
        menu_item_id: z.string().uuid('Invalid menu item id'),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, 'Cart is empty')
    .max(50, 'Too many items'),
})

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled']),
})

export const placeOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = placeOrderSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400)
    const order = await orderService.placeOrder(parsed.data.vendor_id, parsed.data.items)
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
    const page = Math.max(1, Number(req.query.page) || 1) // clamp — negative page crashed Prisma
    const orders = await orderService.getVendorOrders(req.vendorId!, page)
    sendSuccess(res, orders)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Invalid status', 400)
    const order = await orderService.changeOrderStatus(
      req.vendorId!,
      req.params.orderId as string,
      parsed.data.status as OrderStatus
    )
    sendSuccess(res, order)
  } catch (err: any) {
    sendError(res, err.message)
  }
}