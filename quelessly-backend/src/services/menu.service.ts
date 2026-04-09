import * as menuRepo from '../repositories/menu.repository'

export const getPublicMenu = (vendorId: string) =>
  menuRepo.getAvailableMenuByVendor(vendorId)

export const getVendorMenu = (vendorId: string) =>
  menuRepo.getMenuByVendor(vendorId)

export const addMenuItem = async (
  vendorId: string,
  data: { name: string; price: number; categories: string[]; image_url?: string }
) => {
  if (data.price <= 0) throw new Error('Price must be greater than 0')
  if (!data.categories || data.categories.length === 0)
    throw new Error('At least one category is required')
  return menuRepo.createMenuItem({ ...data, vendor_id: vendorId })
}

export const editMenuItem = async (
  vendorId: string,
  itemId: string,
  data: { name?: string; price?: number; categories?: string[]; image_url?: string; is_available?: boolean }
) => {
  const item = await menuRepo.getMenuItemById(itemId)
  if (!item) throw new Error('Item not found')
  if (item.vendor_id !== vendorId) throw new Error('Unauthorized')
  if (data.categories !== undefined && data.categories.length === 0)
    throw new Error('At least one category is required')
  return menuRepo.updateMenuItem(itemId, data)
}

export const removeMenuItem = async (vendorId: string, itemId: string) => {
  const item = await menuRepo.getMenuItemById(itemId)
  if (!item) throw new Error('Item not found')
  if (item.vendor_id !== vendorId) throw new Error('Unauthorized')
  return menuRepo.deleteMenuItem(itemId)
}