import { createSlice } from '@reduxjs/toolkit'

const INITIAL_BULK_ORDERS = [
  {
    id: 'BLK-001',
    name: 'Siddharth Roy',
    organization: 'Apex Software Pvt Ltd',
    email: 'siddharth@apex.com',
    phone: '+91 98888 77777',
    quantity: '2,000 packs',
    eventDate: '2026-07-20',
    message: 'Need customized packaging snack mix for our annual corporate day celebrations. Products preferred: Moon Lite, Katori and Noodles.',
    status: 'Contacted',
    date: '2026-07-01T11:20:00Z'
  },
  {
    id: 'BLK-002',
    name: 'Renu Sharma',
    organization: 'Bal Bharati Public School',
    email: 'info@balbharati.edu.in',
    phone: '+91 97777 66666',
    quantity: '5,000 packs',
    eventDate: '2026-08-15',
    message: 'We are organizing Independence Day hampers for children. Need delivery of 5PM Pasta and Salted Pipe in Sonipat by 12th August.',
    status: 'Pending',
    date: '2026-07-06T10:15:00Z'
  },
  {
    id: 'BLK-003',
    name: 'Ketan Vora',
    organization: 'Vora Event Planners',
    email: 'ketan@voraevents.com',
    phone: '+91 96666 55555',
    quantity: '1,500 packs',
    eventDate: '2026-07-12',
    message: 'Looking for a mixed selection of all 7 Zaylo products at dealer margins for a community fair.',
    status: 'Pending',
    date: '2026-07-06T16:30:00Z'
  }
]

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-bulk-orders')
  return saved ? JSON.parse(saved) : INITIAL_BULK_ORDERS
}

const bulkOrdersSlice = createSlice({
  name: 'bulkOrders',
  initialState: {
    items: loadInitialState()
  },
  reducers: {
    addBulkOrder: (state, action) => {
      state.items.unshift(action.payload)
      localStorage.setItem('zaylo-admin-bulk-orders', JSON.stringify(state.items))
    },
    updateBulkOrderStatus: (state, action) => {
      const { id, status } = action.payload
      const index = state.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.items[index].status = status
        localStorage.setItem('zaylo-admin-bulk-orders', JSON.stringify(state.items))
      }
    },
    deleteBulkOrder: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-bulk-orders', JSON.stringify(state.items))
    },
    bulkUpdateBulkOrderStatus: (state, action) => {
      const { ids, status } = action.payload
      state.items = state.items.map(item => 
        ids.includes(item.id) ? { ...item, status } : item
      )
      localStorage.setItem('zaylo-admin-bulk-orders', JSON.stringify(state.items))
    },
    bulkDeleteBulkOrders: (state, action) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id))
      localStorage.setItem('zaylo-admin-bulk-orders', JSON.stringify(state.items))
    }
  }
})

export const {
  addBulkOrder,
  updateBulkOrderStatus,
  deleteBulkOrder,
  bulkUpdateBulkOrderStatus,
  bulkDeleteBulkOrders
} = bulkOrdersSlice.actions

export default bulkOrdersSlice.reducer
