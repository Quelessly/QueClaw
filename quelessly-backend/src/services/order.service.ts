import * as orderRepo from '../repositories/order.repository'
import * as menuRepo from '../repositories/menu.repository'
import { isValidTransition } from '../utils/orderStateMachine'
import { OrderStatus } from '@prisma/client'
import { getIO } from '../config/socket'

export const placeOrder = async (
  vendorId: string,
  items: { menu_item_id: string; quantity: number }[]
) => {
  if (!items || items.length === 0) throw new Error('Cart is empty')

  const menuItems = await Promise.all(
    items.map((i) => menuRepo.getMenuItemById(i.menu_item_id))
  )

  for (const item of menuItems) {
    if (!item) throw new Error('Menu item not found')
    if (item.vendor_id !== vendorId) throw new Error('Item does not belong to this vendor')
    if (!item.is_available) throw new Error(`${item.name} is not available`)
  }

  const orderItems = items.map((i, idx) => ({
    menu_item_id: i.menu_item_id,
    quantity: i.quantity,
    price: Number(menuItems[idx]!.price),
  }))

  const total_amount = orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity, 0
  )

  const expires_at = new Date(Date.now() + 15 * 60 * 1000)

  const order = await orderRepo.createOrder({
    vendor_id: vendorId,
    total_amount,
    expires_at,
    order_items: orderItems,
  })

  return order
}

export const getOrder = async (orderId: string) => {
  const order = await orderRepo.getOrderById(orderId)
  if (!order) throw new Error('Order not found')
  return order
}

export const getVendorOrders = (vendorId: string, page: number) =>
  orderRepo.getOrdersByVendor(vendorId, page)

export const changeOrderStatus = async (
  vendorId: string,
  orderId: string,
  newStatus: OrderStatus
) => {
  const order = await orderRepo.getOrderById(orderId)
  if (!order) throw new Error('Order not found')
  if (order.vendor_id !== vendorId) throw new Error('Unauthorized')

  if (!isValidTransition(order.status, newStatus)) {
    throw new Error(`Cannot move order from ${order.status} to ${newStatus}`)
  }

  const updated = await orderRepo.updateOrderStatus(orderId, newStatus)

  // Emit to student tracking this order
  try {
    const io = getIO()
    io.to(`order_${orderId}`).emit('order_status_updated', {
      order_id: orderId,
      status: newStatus,
    })

    // Emit to vendor dashboard too (for their order list)
    io.to(`vendor_${vendorId}`).emit('order_updated', {
      order_id: orderId,
      status: newStatus,
    })
  } catch (e) {
    // Socket not critical — don't fail the request
  }

  return updated
}