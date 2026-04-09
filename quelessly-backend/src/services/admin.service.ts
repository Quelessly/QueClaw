import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function inviteVendor(email: string, phone: string, name: string) {
  // Check if vendor already exists
  const existing = await prisma.vendor.findUnique({ where: { email } })
  if (existing) throw new Error('A vendor with this email already exists')

  const otp = generateOTP()
  const expires_at = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Upsert invite (allow resending OTP)
  await prisma.vendorInvite.upsert({
    where: { email },
    update: { otp, phone, expires_at, verified: false },
    create: { email, phone, otp, expires_at },
  })

  // Send OTP email via Resend
  await resend.emails.send({
    from: 'Quelessly <onboarding@resend.dev>',
    to: email,
    subject: 'Your Quelessly Vendor OTP',
    html: `
      <div style="font-family: monospace; background: #09090b; color: #fff; padding: 32px; border-radius: 12px; max-width: 400px;">
        <h2 style="color: #a3e635; margin: 0 0 8px;">quelessly.</h2>
        <p style="color: #71717a; margin: 0 0 24px; font-size: 13px;">Vendor onboarding</p>
        <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 16px;">
          Hi <strong style="color: #fff;">${name}</strong>, here is your OTP to activate your vendor account:
        </p>
        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #a3e635;">
          ${otp}
        </div>
        <p style="color: #52525b; font-size: 12px; margin: 16px 0 0;">
          Expires in 15 minutes. Do not share this with anyone.
        </p>
      </div>
    `,
  })

  console.log(`[admin] OTP sent to ${email} — OTP: ${otp}`) // dev convenience
}

export async function verifyAndCreateVendor(email: string, otp: string, password: string) {
  const invite = await prisma.vendorInvite.findUnique({ where: { email } })

  if (!invite) throw new Error('No invite found for this email')
  if (invite.verified) throw new Error('Invite already used')
  if (invite.otp !== otp) throw new Error('Invalid OTP')
  if (new Date() > invite.expires_at) throw new Error('OTP has expired')

  const password_hash = await bcrypt.hash(password, 12)

  // Create vendor + mark invite as used in a transaction
  const vendor = await prisma.$transaction(async (tx) => {
    const v = await tx.vendor.create({
      data: {
        name: email.split('@')[0], // fallback name, can be updated later
        email,
        password_hash,
      },
      select: { id: true, name: true, email: true, created_at: true },
    })
    await tx.vendorInvite.update({
      where: { email },
      data: { verified: true },
    })
    return v
  })

  return vendor
}