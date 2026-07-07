import { createSlice } from '@reduxjs/toolkit'

const INITIAL_CATEGORIES = [
  { id: 'moon-lite', name: 'Moon Lite', slug: 'moon-lite', comingSoon: false, color: 'from-brand-primary to-brand-orange', status: 'Active' },
  { id: 'katori', name: 'Katori', slug: 'katori', comingSoon: false, color: 'from-brand-primary to-brand-yellow', status: 'Active' },
  { id: 'dhamal-chokdi', name: 'Dhamal Chokdi', slug: 'dhamal-chokdi', comingSoon: false, color: 'from-brand-primary to-brand-yellow', status: 'Active' },
  { id: 'noodles', name: 'Noodles', slug: 'noodles', comingSoon: false, color: 'from-brand-primary to-brand-primary/70', status: 'Active' },
  { id: '5pm-pasta', name: '5PM Pasta', slug: '5pm-pasta', comingSoon: false, color: 'from-brand-primary to-brand-orange', status: 'Active' },
  { id: 'salted-pipe', name: 'Salted Pipe', slug: 'salted-pipe', comingSoon: false, color: 'from-brand-orange to-brand-yellow', status: 'Active' },
  { id: 'zig-zac', name: 'Zig Zac', slug: 'zig-zac', comingSoon: false, color: 'from-surface-dark to-brand-primary', status: 'Active' },
  { id: 'chips', name: 'Chips', slug: 'chips', comingSoon: true, color: 'from-brand-yellow to-brand-orange', status: 'Inactive' },
  { id: 'namkeen', name: 'Namkeen', slug: 'namkeen', comingSoon: true, color: 'from-brand-primary to-brand-gold', status: 'Inactive' },
  { id: 'ready-to-eat', name: 'Ready To Eat', slug: 'ready-to-eat', comingSoon: true, color: 'from-brand-primary to-brand-yellow', status: 'Inactive' },
  { id: 'frozen', name: 'Frozen Foods', slug: 'frozen', comingSoon: true, color: 'from-blue-400 to-brand-primary', status: 'Inactive' },
  { id: 'healthy', name: 'Healthy Snacks', slug: 'healthy', comingSoon: true, color: 'from-brand-primary to-emerald-400', status: 'Inactive' },
  { id: 'kids', name: 'Kids Snacks', slug: 'kids', comingSoon: true, color: 'from-brand-yellow to-pink-400', status: 'Inactive' },
  { id: 'beverages', name: 'Beverages', slug: 'beverages', comingSoon: true, color: 'from-brand-orange to-brand-primary', status: 'Inactive' },
  { id: 'seasonal', name: 'Seasonal', slug: 'seasonal', comingSoon: true, color: 'from-brand-gold to-brand-primary', status: 'Inactive' },
  { id: 'biscuits', name: 'Biscuits', slug: 'biscuits', comingSoon: true, color: 'from-amber-400 to-brand-yellow', status: 'Inactive' }
]

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-categories')
  return saved ? JSON.parse(saved) : INITIAL_CATEGORIES
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: loadInitialState()
  },
  reducers: {
    addCategory: (state, action) => {
      const newCat = {
        ...action.payload,
        id: action.payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        slug: action.payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }
      state.items.push(newCat)
      localStorage.setItem('zaylo-admin-categories', JSON.stringify(state.items))
    },
    editCategory: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload }
        localStorage.setItem('zaylo-admin-categories', JSON.stringify(state.items))
      }
    },
    deleteCategory: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-categories', JSON.stringify(state.items))
    },
    toggleCategoryStatus: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload)
      if (index !== -1) {
        state.items[index].status = state.items[index].status === 'Active' ? 'Inactive' : 'Active'
        state.items[index].comingSoon = state.items[index].status === 'Inactive'
        localStorage.setItem('zaylo-admin-categories', JSON.stringify(state.items))
      }
    },
    bulkDeleteCategories: (state, action) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id))
      localStorage.setItem('zaylo-admin-categories', JSON.stringify(state.items))
    }
  }
})

export const {
  addCategory,
  editCategory,
  deleteCategory,
  toggleCategoryStatus,
  bulkDeleteCategories
} = categoriesSlice.actions

export default categoriesSlice.reducer
