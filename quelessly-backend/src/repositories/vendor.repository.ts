import { prisma } from '../config/prisma'

export const findVendorByEmail = (email: string) =>
  prisma.vendor.findUnique({ where: { email } })

export const createVendor = (data: {
  name: string
  email: string
  password_hash: string
}) => prisma.vendor.create({ data })

export const findVendorById = (id: string) =>
  prisma.vendor.findUnique({ where: { id } })