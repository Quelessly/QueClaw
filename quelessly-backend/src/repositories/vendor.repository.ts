import { prisma } from '../config/prisma'

export const findVendorByEmail = (email: string) =>
  prisma.vendor.findUnique({ where: { email } })

export const findVendorById = (id: string) =>
  prisma.vendor.findUnique({ where: { id } })

export const createVendor = (data: {
  name: string
  email: string
  password_hash: string
}) => prisma.vendor.create({ data })

export const updateVendor = (id: string, data: { name?: string; upi_id?: string }) =>
  prisma.vendor.update({ where: { id }, data })