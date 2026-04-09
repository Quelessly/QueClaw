import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function inviteVendor(
  email: string,
  phone: string,
  name: string,
  upiId?: string
) {
  const existing = await prisma.vendor.findUnique({ where: { email } })
  if (existing) throw new Error('A vendor with this email already exists')

  const otp = generateOTP()
  const expires_at = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.vendorInvite.upsert({
    where: { email },
    update: { otp, phone, name, upi_id: upiId ?? null, expires_at, verified: false },
    create: { email, phone, name, otp, upi_id: upiId ?? null, expires_at },
  })

  await resend.emails.send({
    from: 'Quelessly <noreply@quelessly.com>',
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

  console.log(`[admin] OTP sent to ${email} — OTP: ${otp}`)
}

export async function verifyAndCreateVendor(
  email: string,
  otp: string,
  password: string
) {
  const invite = await prisma.vendorInvite.findUnique({ where: { email } })

  if (!invite) throw new Error('No invite found for this email')
  if (invite.verified) throw new Error('Invite already used')
  if (invite.otp !== otp) throw new Error('Invalid OTP')
  if (new Date() > invite.expires_at) throw new Error('OTP has expired')

  const password_hash = await bcrypt.hash(password, 12)

  const vendor = await prisma.$transaction(async (tx) => {
    const v = await tx.vendor.create({
      data: {
        name: invite.name || email.split('@')[0],
        email,
        password_hash,
        upi_id: invite.upi_id ?? null,
      },
      select: { id: true, name: true, email: true, upi_id: true, created_at: true },
    })
    await tx.vendorInvite.update({
      where: { email },
      data: { verified: true },
    })
    return v
  })

  return vendor
}

export async function getSettlements(date: string) {
  const vendors = await prisma.vendor.findMany({
    select: { id: true, name: true, email: true, upi_id: true },
  })

  const startOfDay = new Date(`${date}T00:00:00.000Z`)
  const endOfDay = new Date(`${date}T23:59:59.999Z`)

  const results = await Promise.all(
    vendors.map(async (vendor) => {
      const orders = await prisma.order.findMany({
        where: {
          vendor_id: vendor.id,
          status: 'completed',
          created_at: { gte: startOfDay, lte: endOfDay },
        },
        select: { id: true, total_amount: true },
      })

      const grossAmount = orders.reduce(
        (sum, o) => sum + Number(o.total_amount), 0
      )

      const settlement = await prisma.vendorSettlement.findUnique({
        where: { vendor_id_date: { vendor_id: vendor.id, date: new Date(date) } },
      })

      return {
        vendor,
        totalOrders: orders.length,
        grossAmount,
        settled: settlement?.payout_status === 'done',
        settlementId: settlement?.id ?? null,
      }
    })
  )

  return results
}

export async function markSettled(
  vendorId: string,
  date: string,
  grossAmount: number,
  totalOrders: number
) {
  const platformFee = 0
  const netAmount = grossAmount - platformFee

  const settlement = await prisma.vendorSettlement.upsert({
    where: { vendor_id_date: { vendor_id: vendorId, date: new Date(date) } },
    update: {
      payout_status: 'done',
      settled_at: new Date(),
      gross_amount: grossAmount,
      net_amount: netAmount,
      total_orders: totalOrders,
    },
    create: {
      vendor_id: vendorId,
      date: new Date(date),
      total_orders: totalOrders,
      gross_amount: grossAmount,
      platform_fee: platformFee,
      net_amount: netAmount,
      payout_status: 'done',
      settled_at: new Date(),
    },
  })

  return settlement
}

export async function updateVendorUpi(vendorId: string, upiId: string) {
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { upi_id: upiId },
    select: { id: true, name: true, email: true, upi_id: true },
  })
  return vendor
}