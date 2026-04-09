import { prisma } from '../config/prisma'

export const getMenuByVendor = (vendor_id: string) =>
  prisma.menuItem.findMany({
    where: { vendor_id },
    orderBy: { created_at: 'asc' },
  })

export const getAvailableMenuByVendor = (vendor_id: string) =>
  prisma.menuItem.findMany({
    where: { vendor_id, is_available: true },
    orderBy: { created_at: 'asc' },
  })

export const getMenuItemById = (id: string) =>
  prisma.menuItem.findUnique({ where: { id } })

export const createMenuItem = (data: {
  vendor_id: string
  name: string
  price: number
  categories: string[]
  image_url?: string
}) => prisma.menuItem.create({ data })

export const updateMenuItem = (id: string, data: {
  name?: string
  price?: number
  categories?: string[]
  image_url?: string
  is_available?: boolean
}) => prisma.menuItem.update({ where: { id }, data })

export const deleteMenuItem = (id: string) =>
  prisma.menuItem.delete({ where: { id } })