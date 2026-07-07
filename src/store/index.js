import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './slices/productsSlice'
import categoriesReducer from './slices/categoriesSlice'
import ordersReducer from './slices/ordersSlice'
import dealersReducer from './slices/dealersSlice'
import bulkOrdersReducer from './slices/bulkOrdersSlice'
import contactsReducer from './slices/contactsSlice'
import blogsReducer from './slices/blogsSlice'
import galleryReducer from './slices/gallerySlice'
import bannersReducer from './slices/bannersSlice'
import usersReducer from './slices/usersSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    dealers: dealersReducer,
    bulkOrders: bulkOrdersReducer,
    contacts: contactsReducer,
    blogs: blogsReducer,
    gallery: galleryReducer,
    banners: bannersReducer,
    users: usersReducer,
    settings: settingsReducer
  }
})
