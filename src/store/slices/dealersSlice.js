import { createSlice } from '@reduxjs/toolkit'

const INITIAL_DEALERS = [
  {
    id: 'DLR-001',
    name: 'Rajesh Kumar',
    businessName: 'Kumar FMCG Distributors',
    email: 'rajesh@kumarfmcg.com',
    phone: '+91 98765 43210',
    location: 'Delhi NCR',
    investment: '₹1,00,000 - ₹2,00,000',
    message: 'We have 15 years of experience in retail distribution in North Delhi. Looking to partner with Zaylo.',
    status: 'Approved',
    date: '2026-06-15T10:00:00Z'
  },
  {
    id: 'DLR-002',
    name: 'Amit Patel',
    businessName: 'Patel Snack Agencies',
    email: 'amit.patel@patelagencies.com',
    phone: '+91 99223 11223',
    location: 'Ahmedabad, Gujarat',
    investment: '₹50,000 - ₹1,00,000',
    message: 'Interested in retail distribution in Satellite and SG Highway areas.',
    status: 'Approved',
    date: '2026-06-28T14:30:00Z'
  },
  {
    id: 'DLR-003',
    name: 'Sunil Kumar',
    businessName: 'Venkateshwara Traders',
    email: 'sunil@venkateshwaratraders.com',
    phone: '+91 94440 55667',
    location: 'Chennai, Tamil Nadu',
    investment: '₹2,00,000+',
    message: 'We distribute snacks to over 400 supermarkets in Chennai. We want sole distribution rights for South Chennai.',
    status: 'Pending',
    date: '2026-07-06T08:00:00Z'
  },
  {
    id: 'DLR-004',
    name: 'Manish Verma',
    businessName: 'Verma Brothers & Co',
    email: 'manish.v@vermatraders.co.in',
    phone: '+91 98990 77665',
    location: 'Lucknow, Uttar Pradesh',
    investment: '₹50,000 - ₹1,00,000',
    message: 'Please send us product samples and pricing catalog for Central UP.',
    status: 'Pending',
    date: '2026-07-06T15:45:00Z'
  }
]

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-dealers')
  return saved ? JSON.parse(saved) : INITIAL_DEALERS
}

const dealersSlice = createSlice({
  name: 'dealers',
  initialState: {
    items: loadInitialState()
  },
  reducers: {
    addDealer: (state, action) => {
      state.items.unshift(action.payload)
      localStorage.setItem('zaylo-admin-dealers', JSON.stringify(state.items))
    },
    updateDealerStatus: (state, action) => {
      const { id, status } = action.payload
      const index = state.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.items[index].status = status
        localStorage.setItem('zaylo-admin-dealers', JSON.stringify(state.items))
      }
    },
    deleteDealer: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-dealers', JSON.stringify(state.items))
    },
    bulkUpdateDealerStatus: (state, action) => {
      const { ids, status } = action.payload
      state.items = state.items.map(item => 
        ids.includes(item.id) ? { ...item, status } : item
      )
      localStorage.setItem('zaylo-admin-dealers', JSON.stringify(state.items))
    },
    bulkDeleteDealers: (state, action) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id))
      localStorage.setItem('zaylo-admin-dealers', JSON.stringify(state.items))
    }
  }
})

export const {
  addDealer,
  updateDealerStatus,
  deleteDealer,
  bulkUpdateDealerStatus,
  bulkDeleteDealers
} = dealersSlice.actions

export default dealersSlice.reducer
