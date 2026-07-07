import { createSlice } from '@reduxjs/toolkit'

const INITIAL_SETTINGS = {
  corporate: {
    title: 'Corporate Office',
    address: "ZAY'LO Snacks Pvt. Ltd., Plot No. 45, Industrial Area, Phase-II, New Delhi - 110020",
    phone: '+91 98765 43210',
    email: 'info@zaylosnacks.com',
  },
  factory: {
    title: 'Manufacturing Unit',
    address: 'ZAY\'LO Foods, Survey No. 128, Food Park, Sonipat, Haryana - 131001',
    phone: '+91 98765 43211',
    email: 'factory@zaylosnacks.com',
  },
  whatsapp: '+91 98765 43210',
  salesTeam: [
    { name: 'North India', contact: 'north@zaylosnacks.com', phone: '+91 98765 43212' },
    { name: 'West India', contact: 'west@zaylosnacks.com', phone: '+91 98765 43213' },
    { name: 'South India', contact: 'south@zaylosnacks.com', phone: '+91 98765 43214' },
  ],
  general: {
    siteName: 'ZAY\'LO Snacks',
    siteTagline: 'Swad Jo Dil Jeet Le',
    themeDefault: 'emerald',
    modeDefault: 'light',
    allowRegistrations: true,
    maintenanceMode: false
  }
}

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-settings')
  return saved ? JSON.parse(saved) : INITIAL_SETTINGS
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadInitialState(),
  reducers: {
    updateGeneralSettings: (state, action) => {
      state.general = { ...state.general, ...action.payload }
      localStorage.setItem('zaylo-admin-settings', JSON.stringify(state))
    },
    updateCorporateSettings: (state, action) => {
      state.corporate = { ...state.corporate, ...action.payload }
      localStorage.setItem('zaylo-admin-settings', JSON.stringify(state))
    },
    updateFactorySettings: (state, action) => {
      state.factory = { ...state.factory, ...action.payload }
      localStorage.setItem('zaylo-admin-settings', JSON.stringify(state))
    },
    updateSalesTeam: (state, action) => {
      state.salesTeam = action.payload
      localStorage.setItem('zaylo-admin-settings', JSON.stringify(state))
    }
  }
})

export const {
  updateGeneralSettings,
  updateCorporateSettings,
  updateFactorySettings,
  updateSalesTeam
} = settingsSlice.actions

export default settingsSlice.reducer
