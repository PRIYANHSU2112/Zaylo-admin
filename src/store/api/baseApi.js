import { createApi } from '@reduxjs/toolkit/query/react'
import { apiBaseQuery } from '../../lib/apiBaseQuery'

export const TAGS = {
  Product: 'Product',
  Category: 'Category',
  Order: 'Order',
  Dealer: 'Dealer',
  BulkOrder: 'BulkOrder',
  Contact: 'Contact',
  Blog: 'Blog',
  Gallery: 'Gallery',
  Announcement: 'Announcement',
  Promo: 'Promo',
  LandingImage: 'LandingImage',
  Bundle: 'Bundle',
  User: 'User',
  Settings: 'Settings',
  Cms: 'Cms',
  Dashboard: 'Dashboard',
  Notification: 'Notification',
  Auth: 'Auth',
  Coupon: 'Coupon',
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: apiBaseQuery,
  tagTypes: Object.values(TAGS),
  endpoints: () => ({}),
})
