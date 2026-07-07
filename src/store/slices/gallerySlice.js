import { createSlice } from '@reduxjs/toolkit'

const INITIAL_GALLERY = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800&auto=format&fit=crop',
    title: 'Spicy Snacks Selection',
    category: 'Products'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?q=80&w=800&auto=format&fit=crop',
    title: 'Factory Quality Control',
    category: 'Factory'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop',
    title: 'Traditional Spices',
    category: 'Products'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
    title: 'Annual Dealer Meet 2026',
    category: 'Events'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
    title: 'Automated Packaging Line',
    category: 'Factory'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop',
    title: 'Festival Hamper Launch',
    category: 'Events'
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1596647970792-57dfb7a950fb?q=80&w=800&auto=format&fit=crop',
    title: 'Premium Raw Ingredients',
    category: 'Factory'
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=800&auto=format&fit=crop',
    title: 'Road Trip Snacks',
    category: 'Products'
  }
]

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-gallery')
  return saved ? JSON.parse(saved) : INITIAL_GALLERY
}

const gallerySlice = createSlice({
  name: 'gallery',
  initialState: {
    items: loadInitialState()
  },
  reducers: {
    addGalleryImage: (state, action) => {
      const newImage = {
        ...action.payload,
        id: (state.items.length + 1).toString()
      }
      state.items.unshift(newImage)
      localStorage.setItem('zaylo-admin-gallery', JSON.stringify(state.items))
    },
    editGalleryImage: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload }
        localStorage.setItem('zaylo-admin-gallery', JSON.stringify(state.items))
      }
    },
    deleteGalleryImage: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-gallery', JSON.stringify(state.items))
    },
    bulkDeleteGalleryImages: (state, action) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id))
      localStorage.setItem('zaylo-admin-gallery', JSON.stringify(state.items))
    }
  }
})

export const {
  addGalleryImage,
  editGalleryImage,
  deleteGalleryImage,
  bulkDeleteGalleryImages
} = gallerySlice.actions

export default gallerySlice.reducer
