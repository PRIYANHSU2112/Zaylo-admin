import { createSlice } from '@reduxjs/toolkit'

const INITIAL_ORDERS = [
  {
    id: 'ORD-5839',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '+91 98765 43210',
    amount: 25.00,
    status: 'Delivered',
    date: '2026-07-04T14:32:00Z',
    paymentMethod: 'UPI',
    shippingAddress: '123 Palm Grove, Block B, New Delhi, 110001',
    items: [
      { id: '1', name: 'Moon Lite', price: 5.00, quantity: 3 },
      { id: '2', name: 'Katori', price: 5.00, quantity: 2 }
    ]
  },
  {
    id: 'ORD-5840',
    customerName: 'Rohan Sharma',
    customerEmail: 'rohan.sharma@gmail.com',
    customerPhone: '+91 98112 23344',
    amount: 15.00,
    status: 'Shipped',
    date: '2026-07-05T09:15:00Z',
    paymentMethod: 'Card',
    shippingAddress: 'Flat 402, Royal Residency, Sector 56, Gurgaon, 122001',
    items: [
      { id: '4', name: 'Noodles', price: 5.00, quantity: 3 }
    ]
  },
  {
    id: 'ORD-5841',
    customerName: 'Pooja Patel',
    customerEmail: 'pooja.patel@yahoo.com',
    customerPhone: '+91 99223 34455',
    amount: 40.00,
    status: 'Pending',
    date: '2026-07-06T11:45:00Z',
    paymentMethod: 'COD',
    shippingAddress: 'B-104 Shanti Kunj, Satellite, Ahmedabad, 380015',
    items: [
      { id: '5', name: '5PM Pasta', price: 5.00, quantity: 5 },
      { id: '7', name: 'Zig Zac', price: 5.00, quantity: 3 }
    ]
  },
  {
    id: 'ORD-5842',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@outlook.com',
    customerPhone: '+91 88776 65544',
    amount: 10.00,
    status: 'Cancelled',
    date: '2026-07-06T17:20:00Z',
    paymentMethod: 'UPI',
    shippingAddress: 'House 56, Sector 15-A, Chandigarh, 160015',
    items: [
      { id: '6', name: 'Salted Pipe', price: 5.00, quantity: 2 }
    ]
  }
]

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-orders')
  return saved ? JSON.parse(saved) : INITIAL_ORDERS
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: loadInitialState()
  },
  reducers: {
    addOrder: (state, action) => {
      state.items.unshift(action.payload)
      localStorage.setItem('zaylo-admin-orders', JSON.stringify(state.items))
    },
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload
      const index = state.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.items[index].status = status
        localStorage.setItem('zaylo-admin-orders', JSON.stringify(state.items))
      }
    },
    deleteOrder: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-orders', JSON.stringify(state.items))
    },
    bulkUpdateOrderStatus: (state, action) => {
      const { ids, status } = action.payload
      state.items = state.items.map(item => 
        ids.includes(item.id) ? { ...item, status } : item
      )
      localStorage.setItem('zaylo-admin-orders', JSON.stringify(state.items))
    },
    bulkDeleteOrders: (state, action) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id))
      localStorage.setItem('zaylo-admin-orders', JSON.stringify(state.items))
    }
  }
})

export const {
  addOrder,
  updateOrderStatus,
  deleteOrder,
  bulkUpdateOrderStatus,
  bulkDeleteOrders
} = ordersSlice.actions

export default ordersSlice.reducer
