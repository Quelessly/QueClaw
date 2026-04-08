import { prisma } from '../config/prisma'
import { OrderStatus } from '@prisma/client'

export const createOrder = (data: {
  vendor_id: string
  total_amount: number
  expires_at: Date
  order_items: {
    menu_item_id: string
    quantity: number
    price: number
  }[]
}) =>
  prisma.order.create({
    data: {
      vendor_id: data.vendor_id,
      total_amount: data.total_amount,
      expires_at: data.expires_at,
      order_items: {
        create: data.order_items,
      },
    },
    include: { order_items: true },
  })

export const getOrderById = (id: string) =>
  prisma.order.findUnique({
    where: { id },
    include: { order_items: { include: { menu_item: true } }, payment: true },
  })

export const getOrdersByVendor = (vendor_id: string, page = 1, limit = 20) =>
  prisma.order.findMany({
    where: { vendor_id },
    include: { order_items: { include: { menu_item: true } } },
    orderBy: { created_at: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

export const updateOrderStatus = (id: string, status: OrderStatus) =>
  prisma.order.update({ where: { id }, data: { status } })

export const updateOrderPaymentStatus = (id: string, payment_status: string) =>
  prisma.order.update({
    where: { id },
    data: { payment_status: payment_status as any },
  })