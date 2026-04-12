import { Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middlewares/auth.middleware'
import { z } from 'zod'

const resetRequestSchema = z.object({
  email: z.string().email('Invalid email'),
})

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body
    const data = await authService.login(email, password)
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message, 401)
  }
}

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.vendorId
    if (!vendorId) return sendError(res, 'Unauthorized', 401)
    const { name } = req.body
    if (!name || !name.trim()) return sendError(res, 'Name is required', 400)
    const data = await authService.updateProfile(vendorId, name.trim())
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const getVendorPublic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.vendorId as string
    const data = await authService.getVendorPublic(vendorId)
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message, 404)
  }
}

export const requestPasswordReset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = resetRequestSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400)
    const data = await authService.requestPasswordReset(parsed.data.email)
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400)
    const data = await authService.resetPassword(
      parsed.data.email,
      parsed.data.otp,
      parsed.data.newPassword
    )
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message, 400)
  }
}