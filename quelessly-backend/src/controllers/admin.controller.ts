import { Request, Response, NextFunction } from 'express'
import * as adminService from '../services/admin.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

const checkAdmin = (req: Request, res: Response): boolean => {
  if (req.body.adminSecret !== process.env.ADMIN_SECRET &&
      req.query.adminSecret !== process.env.ADMIN_SECRET &&
      req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    sendError(res, 'Unauthorized', 401)
    return false
  }
  return true
}

export const inviteVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminSecret, email, phone, name } = req.body
    if (adminSecret !== process.env.ADMIN_SECRET) return sendError(res, 'Unauthorized', 401)
    if (!email || !phone || !name) return sendError(res, 'name, email and phone are required', 400)
    await adminService.inviteVendor(email, phone, name)
    sendSuccess(res, { message: 'OTP sent to vendor email' }, 200)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const verifyVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminSecret, email, otp, password } = req.body
    if (adminSecret !== process.env.ADMIN_SECRET) return sendError(res, 'Unauthorized', 401)
    if (!email || !otp || !password) return sendError(res, 'email, otp and password are required', 400)
    const vendor = await adminService.verifyAndCreateVendor(email, otp, password)
    sendSuccess(res, vendor, 201)
  } catch (err: any) {
    sendError(res, err.message, 400)
  }
}

export const getSettlements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.query.adminSecret !== process.env.ADMIN_SECRET) return sendError(res, 'Unauthorized', 401)
    const date = req.query.date as string || new Date().toISOString().split('T')[0]
    const data = await adminService.getSettlements(date)
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const markSettled = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminSecret, vendorId, date, grossAmount, totalOrders } = req.body
    if (adminSecret !== process.env.ADMIN_SECRET) return sendError(res, 'Unauthorized', 401)
    if (!vendorId || !date) return sendError(res, 'vendorId and date are required', 400)
    const result = await adminService.markSettled(vendorId, date, grossAmount, totalOrders)
    sendSuccess(res, result)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const updateVendorUpi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminSecret, upiId } = req.body
    if (adminSecret !== process.env.ADMIN_SECRET) return sendError(res, 'Unauthorized', 401)
    const vendorId = req.params.vendorId as string
    const vendor = await adminService.updateVendorUpi(vendorId, upiId)
    sendSuccess(res, vendor)
  } catch (err: any) {
    sendError(res, err.message)
  }
}