import { OrderStatus } from '@prisma/client'

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:   ['paid', 'cancelled'],
  paid:      ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready:     ['completed'],
  completed: [],
  cancelled: [],
}

export const isValidTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}