import { Request, Response, NextFunction } from 'express'
import * as adminService from '../services/admin.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const inviteVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminSecret, email, phone, name } = req.body
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return sendError(res, 'Unauthorized', 401)
    }
    if (!email || !phone || !name) {
      return sendError(res, 'name, email and phone are required', 400)
    }
    await adminService.inviteVendor(email, phone, name)
    sendSuccess(res, { message: 'OTP sent to vendor email' }, 200)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const verifyVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminSecret, email, otp, password } = req.body
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return sendError(res, 'Unauthorized', 401)
    }
    if (!email || !otp || !password) {
      return sendError(res, 'email, otp and password are required', 400)
    }
    const vendor = await adminService.verifyAndCreateVendor(email, otp, password)
    sendSuccess(res, vendor, 201)
  } catch (err: any) {
    sendError(res, err.message, 400)
  }
}