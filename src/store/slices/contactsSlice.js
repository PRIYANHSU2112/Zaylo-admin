import { createSlice } from '@reduxjs/toolkit'

const INITIAL_CONTACTS = [
  {
    id: 'CON-001',
    name: 'Alok Nath',
    email: 'alok.nath@sanskari.com',
    subject: 'snack availability in Varanasi',
    message: 'Greetings. I want to buy Dhamal Chokdi and Moon Lite in bulk for a family gather in Varanasi, but I could not find a retailer nearby. Can you guide me where to purchase them?',
    status: 'Replied',
    date: '2026-07-02T10:05:00Z'
  },
  {
    id: 'CON-002',
    name: 'Priya Sen',
    email: 'priya.sen@outlook.com',
    subject: 'Nutritional Info Request',
    message: 'Could you please confirm the exact sodium content in Moon Lite snacks? My father has high blood pressure and I need to verify before purchasing.',
    status: 'New',
    date: '2026-07-06T09:12:00Z'
  },
  {
    id: 'CON-003',
    name: 'Devendra Joshi',
    email: 'djoshi@gmail.com',
    subject: 'Feedback: Amazing Taste',
    message: 'Just wanted to say that Katori and 5PM Pasta taste absolutely fantastic! At ₹5, this is a revolution in Indian snacking. Kudos to the manufacturing team!',
    status: 'Read',
    date: '2026-07-06T14:40:00Z'
  }
]

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-contacts')
  return saved ? JSON.parse(saved) : INITIAL_CONTACTS
}

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    items: loadInitialState()
  },
  reducers: {
    addContact: (state, action) => {
      state.items.unshift(action.payload)
      localStorage.setItem('zaylo-admin-contacts', JSON.stringify(state.items))
    },
    updateContactStatus: (state, action) => {
      const { id, status } = action.payload
      const index = state.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.items[index].status = status
        localStorage.setItem('zaylo-admin-contacts', JSON.stringify(state.items))
      }
    },
    deleteContact: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-contacts', JSON.stringify(state.items))
    },
    bulkUpdateContactStatus: (state, action) => {
      const { ids, status } = action.payload
      state.items = state.items.map(item => 
        ids.includes(item.id) ? { ...item, status } : item
      )
      localStorage.setItem('zaylo-admin-contacts', JSON.stringify(state.items))
    },
    bulkDeleteContacts: (state, action) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id))
      localStorage.setItem('zaylo-admin-contacts', JSON.stringify(state.items))
    }
  }
})

export const {
  addContact,
  updateContactStatus,
  deleteContact,
  bulkUpdateContactStatus,
  bulkDeleteContacts
} = contactsSlice.actions

export default contactsSlice.reducer
