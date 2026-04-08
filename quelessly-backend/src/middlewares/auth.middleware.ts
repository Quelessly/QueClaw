import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { sendError } from '../utils/apiResponse'

export interface AuthRequest extends Request {
  vendorId?: string
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return sendError(res, 'Unauthorized', 401)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { vendorId: string }
    req.vendorId = payload.vendorId
    next()
  } catch {
    sendError(res, 'Invalid token', 401)
  }
}