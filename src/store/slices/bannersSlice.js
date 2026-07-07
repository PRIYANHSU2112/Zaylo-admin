import { createSlice } from '@reduxjs/toolkit'

const INITIAL_ANNOUNCEMENTS = [
  { id: '1', text: "🎉 Festival Offer — Buy 10 Get 2 Free on all ZAY'LO products!", link: '/products', status: 'Active' },
  { id: '2', text: '🚀 New Launch — Try Katori & 5PM Pasta at just ₹5!', link: '/products', status: 'Active' },
  { id: '3', text: "🤝 Become a ZAY'LO Distributor — High margins & full support", link: '/dealer', status: 'Active' }
]

const INITIAL_PROMOS = [
  {
    id: 'festival',
    title: 'Festival Special Offer',
    subtitle: "Celebrate with ZAY'LO — Swad Jo Dil Jeet Le",
    cta: 'Shop Now',
    link: '/products',
    gradient: 'from-brand-primary via-brand-primary-dark to-surface-dark',
    badge: 'Limited Time',
    status: 'Active'
  },
  {
    id: 'dealer',
    title: "Become a ZAY'LO Distributor",
    subtitle: 'Join 5000+ dealers across India. High margins, marketing support & training.',
    cta: 'Apply Now',
    link: '/dealer',
    gradient: 'from-surface-dark to-brand-primary-dark',
    badge: 'Partner With Us',
    status: 'Active'
  },
  {
    id: 'new-launch',
    title: 'New Product Launch',
    subtitle: 'Introducing Katori & 5PM Pasta — Crispy delights at ₹5 only.',
    cta: 'Explore New',
    link: '/products',
    gradient: 'from-brand-primary-light via-brand-primary to-brand-primary-dark',
    badge: 'Just Launched',
    status: 'Active'
  },
  {
    id: 'summer',
    title: 'Summer Snack Collection',
    subtitle: 'Beat the heat with Zig Zac Spicy & Salted Pipe crunch.',
    cta: 'View Collection',
    link: '/products',
    gradient: 'from-brand-primary via-brand-primary-dark to-main',
    badge: 'Summer 2026',
    status: 'Active'
  }
]

const loadInitialState = () => {
  const savedA = localStorage.getItem('zaylo-admin-announcements')
  const savedP = localStorage.getItem('zaylo-admin-promos')
  return {
    announcements: savedA ? JSON.parse(savedA) : INITIAL_ANNOUNCEMENTS,
    promos: savedP ? JSON.parse(savedP) : INITIAL_PROMOS
  }
}

const bannersSlice = createSlice({
  name: 'banners',
  initialState: loadInitialState(),
  reducers: {
    addAnnouncement: (state, action) => {
      const newAnn = {
        ...action.payload,
        id: (state.announcements.length + 1).toString()
      }
      state.announcements.push(newAnn)
      localStorage.setItem('zaylo-admin-announcements', JSON.stringify(state.announcements))
    },
    editAnnouncement: (state, action) => {
      const index = state.announcements.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.announcements[index] = { ...state.announcements[index], ...action.payload }
        localStorage.setItem('zaylo-admin-announcements', JSON.stringify(state.announcements))
      }
    },
    deleteAnnouncement: (state, action) => {
      state.announcements = state.announcements.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-announcements', JSON.stringify(state.announcements))
    },
    toggleAnnouncementStatus: (state, action) => {
      const index = state.announcements.findIndex(item => item.id === action.payload)
      if (index !== -1) {
        state.announcements[index].status = state.announcements[index].status === 'Active' ? 'Inactive' : 'Active'
        localStorage.setItem('zaylo-admin-announcements', JSON.stringify(state.announcements))
      }
    },
    addPromo: (state, action) => {
      const newPromo = {
        ...action.payload,
        id: action.payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }
      state.promos.push(newPromo)
      localStorage.setItem('zaylo-admin-promos', JSON.stringify(state.promos))
    },
    editPromo: (state, action) => {
      const index = state.promos.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.promos[index] = { ...state.promos[index], ...action.payload }
        localStorage.setItem('zaylo-admin-promos', JSON.stringify(state.promos))
      }
    },
    deletePromo: (state, action) => {
      state.promos = state.promos.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-promos', JSON.stringify(state.promos))
    },
    togglePromoStatus: (state, action) => {
      const index = state.promos.findIndex(item => item.id === action.payload)
      if (index !== -1) {
        state.promos[index].status = state.promos[index].status === 'Active' ? 'Inactive' : 'Active'
        localStorage.setItem('zaylo-admin-promos', JSON.stringify(state.promos))
      }
    }
  }
})

export const {
  addAnnouncement,
  editAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  addPromo,
  editPromo,
  deletePromo,
  togglePromoStatus
} = bannersSlice.actions

export default bannersSlice.reducer
