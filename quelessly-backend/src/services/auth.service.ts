import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { Resend } from 'resend'
import { env } from '../config/env'
import * as vendorRepo from '../repositories/vendor.repository'
import { encrypt } from '../utils/encryption'
import { prisma } from '../config/prisma'

const resend = new Resend(env.RESEND_API_KEY)

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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
  const token = jwt.sign({ vendorId: vendor.id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  })
  return { token, vendor: { id: vendor.id, name: vendor.name, email: vendor.email } }
}

export const updateProfile = async (vendorId: string, name: string) => {
  const vendor = await vendorRepo.updateVendor(vendorId, { name })
  if (!vendor) throw new Error('Vendor not found')
  return { id: vendor.id, name: vendor.name, email: vendor.email }
}

export const getVendorPublic = async (vendorId: string) => {
  const vendor = await vendorRepo.findVendorById(vendorId)
  if (!vendor) throw new Error('Vendor not found')
  return { id: vendor.id, name: vendor.name }
}

export const updateRazorpayKeys = async (
  vendorId: string,
  razorpayKeyId: string,
  razorpayKeySecret: string
) => {
  // Secret is encrypted before it ever touches the DB; plaintext exists
  // only in this request's memory.
  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      razorpay_key_id: razorpayKeyId,
      razorpay_key_secret: encrypt(razorpayKeySecret),
    },
  })
  return { success: true }
}

export const getRazorpayKeyStatus = async (vendorId: string) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { razorpay_key_id: true, razorpay_key_secret: true },
  })
  if (!vendor) throw new Error('Vendor not found')
  return {
    configured: !!(vendor.razorpay_key_id && vendor.razorpay_key_secret),
    key_id_hint: vendor.razorpay_key_id ? `...${vendor.razorpay_key_id.slice(-6)}` : null,
  }
}

export const requestPasswordReset = async (email: string) => {
  const vendor = await vendorRepo.findVendorByEmail(email)
  // Always return success even if email not found — prevents email enumeration
  if (!vendor) return { message: 'If this email exists, an OTP has been sent' }

  const otp = generateOTP()
  const expires_at = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.passwordResetOtp.upsert({
    where: { email },
    update: { otp, expires_at, used: false },
    create: { email, otp, expires_at },
  })

  await resend.emails.send({
    from: 'Quelessly <noreply@quelessly.com>',
    to: email,
    subject: 'Reset your Quelessly password',
    html: `
      <div style="font-family: monospace; background: #09090b; color: #fff; padding: 32px; border-radius: 12px; max-width: 400px;">
        <h2 style="color: #a3e635; margin: 0 0 8px;">quelessly.</h2>
        <p style="color: #71717a; margin: 0 0 24px; font-size: 13px;">Password reset</p>
        <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 16px;">
          Here is your OTP to reset your password:
        </p>
        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #a3e635;">
          ${otp}
        </div>
        <p style="color: #52525b; font-size: 12px; margin: 16px 0 0;">
          Expires in 15 minutes. If you did not request this, ignore this email.
        </p>
      </div>
    `,
  })

  return { message: 'If this email exists, an OTP has been sent' }
}

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const record = await prisma.passwordResetOtp.findUnique({ where: { email } })
  if (!record) throw new Error('Invalid or expired OTP')
  if (record.used) throw new Error('OTP already used')
  if (record.otp !== otp) throw new Error('Invalid OTP')
  if (new Date() > record.expires_at) throw new Error('OTP has expired')
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters')

  const password_hash = await bcrypt.hash(newPassword, 10)

  await prisma.$transaction([
    prisma.vendor.update({
      where: { email },
      data: { password_hash },
    }),
    prisma.passwordResetOtp.update({
      where: { email },
      data: { used: true },
    }),
  ])

  return { message: 'Password reset successfully' }
}