import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import * as vendorRepo from '../repositories/vendor.repository'

export const register = async (name: string, email: string, password: string) => {
  const existing = await vendorRepo.findVendorByEmail(email)
  if (existing) throw new Error('Email already registered')

  const password_hash = await bcrypt.hash(password, 10)
  const vendor = await vendorRepo.createVendor({ name, email, password_hash })

  return { id: vendor.id, name: vendor.name, email: vendor.email }
}

export const login = async (email: string, password: string) => {
  const vendor = await vendorRepo.findVendorByEmail(email)
  if (!vendor) throw new Error('Invalid credentials')

  const valid = await bcrypt.compare(password, vendor.password_hash)
  if (!valid) throw new Error('Invalid credentials')

  const token = jwt.sign(
    { vendorId: vendor.id },
    env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )

  return { token, vendor: { id: vendor.id, name: vendor.name, email: vendor.email } }
}