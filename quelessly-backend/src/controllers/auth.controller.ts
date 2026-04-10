import { Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middlewares/auth.middleware'

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