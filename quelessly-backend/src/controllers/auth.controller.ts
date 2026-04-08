import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body
    const data = await authService.register(name, email, password)
    sendSuccess(res, data, 201)
  } catch (err: any) {
    sendError(res, err.message)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body
    const data = await authService.login(email, password)
    sendSuccess(res, data)
  } catch (err: any) {
    sendError(res, err.message, 401)
  }
}