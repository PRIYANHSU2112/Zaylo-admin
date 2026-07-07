import { createSlice } from '@reduxjs/toolkit'

const INITIAL_PRODUCTS = [
  {
    id: '1',
    slug: 'moon-lite',
    name: 'Moon Lite',
    category: 'namkeen',
    price: 5.00,
    mrp: 5.00,
    weight: '1 Pack',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?q=80&w=300&auto=format&fit=crop',
    tagline: 'Crispy Delight',
    description: 'Golden cup-shaped puffed snacks with a perfect crunch. Moon Lite delivers an irresistible crispy delight that wins hearts with every bite.',
    rating: 4.8,
    reviewCount: 1240,
    isVeg: true,
    isNew: false,
    flavor: 'Tomato Masala',
    nutrition: { calories: 480, fat: '22g', protein: '6g', carbs: '62g' },
    ingredients: ['Corn Grits', 'Edible Vegetable Oil', 'Spices & Condiments', 'Salt', 'Tomato Powder'],
    storage: 'Store in a cool, dry place. Keep away from direct sunlight.',
    status: 'Active',
    stock: 120
  },
  {
    id: '2',
    slug: 'katori',
    name: 'Katori',
    category: 'namkeen',
    price: 5.00,
    mrp: 5.00,
    weight: '1 Pack',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=300&auto=format&fit=crop',
    tagline: 'Crispy Delight',
    description: 'Bowl-shaped crispy snacks crafted for the perfect munch. Katori brings authentic Indian flavors in every golden cup.',
    rating: 4.7,
    reviewCount: 980,
    isVeg: true,
    isNew: true,
    flavor: 'Tomato Ketchup',
    nutrition: { calories: 465, fat: '20g', protein: '5g', carbs: '64g' },
    ingredients: ['Corn Grits', 'Edible Vegetable Oil', 'Spices', 'Tomato Seasoning', 'Salt'],
    storage: 'Store in a cool, dry place. Once opened, consume within 3 days.',
    status: 'Active',
    stock: 45
  },
  {
    id: '3',
    slug: 'dhamal-chokdi',
    name: 'Dhamal Chokdi',
    category: 'namkeen',
    price: 5.00,
    mrp: 5.00,
    weight: '1 Pack',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=300&auto=format&fit=crop',
    tagline: 'Spicy Cross Crunch',
    description: 'Unique cross-shaped puffed crisps with bold masala seasoning. Dhamal Chokdi is pure dhamal in every crunch.',
    rating: 4.6,
    reviewCount: 870,
    isVeg: true,
    isNew: false,
    flavor: 'Masala',
    nutrition: { calories: 490, fat: '23g', protein: '5g', carbs: '60g' },
    ingredients: ['Corn Grits', 'Edible Vegetable Oil', 'Red Chilli', 'Garlic', 'Spices', 'Salt'],
    storage: 'Store in airtight container after opening.',
    status: 'Active',
    stock: 0
  },
  {
    id: '4',
    slug: 'noodles',
    name: 'Noodles',
    category: 'namkeen',
    price: 5.00,
    mrp: 5.00,
    weight: '1 Pack',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=300&auto=format&fit=crop',
    tagline: 'Crispy & Crunchy',
    description: "Extruded cereal sticks fried to golden perfection. ZAY'LO Noodles — the namkeen that never goes out of style.",
    rating: 4.9,
    reviewCount: 2100,
    isVeg: true,
    isNew: false,
    flavor: 'Classic Masala',
    nutrition: { calories: 510, fat: '24g', protein: '7g', carbs: '58g' },
    ingredients: ['Cereals', 'Edible Vegetable Oil', 'Spices', 'Green Peas', 'Tomato', 'Salt'],
    storage: 'Store in cool, dry place. Best before date on pack.',
    status: 'Active',
    stock: 85
  },
  {
    id: '5',
    slug: '5pm-pasta',
    name: '5PM Pasta',
    category: 'namkeen',
    price: 5.00,
    mrp: 5.00,
    weight: '1 Pack',
    image: 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=300&auto=format&fit=crop',
    tagline: 'Italian Peri Peri Masala',
    description: 'Penne-shaped pasta snacks with peri peri masala coating. Perfect for your 5PM hunger — Italian flair, Indian spice.',
    rating: 4.8,
    reviewCount: 1560,
    isVeg: true,
    isNew: true,
    flavor: 'Peri Peri Masala',
    nutrition: { calories: 475, fat: '21g', protein: '6g', carbs: '61g' },
    ingredients: ['Corn Flour', 'Edible Vegetable Oil', 'Peri Peri Seasoning', 'Tomato Powder', 'Salt'],
    storage: 'Keep in cool, dry place away from moisture.',
    status: 'Active',
    stock: 24
  },
  {
    id: '6',
    slug: 'salted-pipe',
    name: 'Salted Pipe',
    category: 'namkeen',
    price: 5.00,
    mrp: 5.00,
    weight: '1 Pack',
    image: 'https://images.unsplash.com/photo-1596647970792-57dfb7a950fb?q=80&w=300&auto=format&fit=crop',
    tagline: 'Spicy & Yummy Taste',
    description: 'Hollow pipe-shaped extruded snacks with a perfectly salted crunch. Light, airy, and addictively delicious.',
    rating: 4.5,
    reviewCount: 720,
    isVeg: true,
    isNew: false,
    flavor: 'Salted',
    nutrition: { calories: 450, fat: '18g', protein: '4g', carbs: '65g' },
    ingredients: ['Corn Grits', 'Edible Vegetable Oil', 'Salt', 'Spices'],
    storage: 'Store in cool, dry place. Reseal after opening.',
    status: 'Inactive',
    stock: 12
  },
  {
    id: '7',
    slug: 'zig-zac',
    name: 'Zig Zac',
    category: 'namkeen',
    price: 5.00,
    mrp: 5.00,
    weight: '1 Pack',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=300&auto=format&fit=crop',
    tagline: 'Spicy Flavour Delicious',
    description: 'Crinkle-cut rectangular chips with bold spicy seasoning. Zig Zac — zigzag your way to flavor heaven.',
    rating: 4.7,
    reviewCount: 1340,
    isVeg: true,
    isNew: false,
    flavor: 'Spicy',
    nutrition: { calories: 495, fat: '22g', protein: '5g', carbs: '63g' },
    ingredients: ['Potato Starch', 'Corn Grits', 'Edible Vegetable Oil', 'Green Chilli', 'Spices', 'Salt'],
    storage: 'Store in cool, dry place. Consume before expiry.',
    status: 'Active',
    stock: 90
  }
]

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-products')
  return saved ? JSON.parse(saved) : INITIAL_PRODUCTS
}

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: loadInitialState()
  },
  reducers: {
    addProduct: (state, action) => {
      const newProduct = {
        ...action.payload,
        id: (state.items.length + 1).toString(),
        slug: action.payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        rating: 5.0,
        reviewCount: 0
      }
      state.items.push(newProduct)
      localStorage.setItem('zaylo-admin-products', JSON.stringify(state.items))
    },
    editProduct: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload }
        localStorage.setItem('zaylo-admin-products', JSON.stringify(state.items))
      }
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-products', JSON.stringify(state.items))
    },
    toggleProductStatus: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload)
      if (index !== -1) {
        state.items[index].status = state.items[index].status === 'Active' ? 'Inactive' : 'Active'
        localStorage.setItem('zaylo-admin-products', JSON.stringify(state.items))
      }
    },
    bulkDeleteProducts: (state, action) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id))
      localStorage.setItem('zaylo-admin-products', JSON.stringify(state.items))
    },
    bulkToggleProductStatus: (state, action) => {
      const { ids, status } = action.payload
      state.items = state.items.map(item => 
        ids.includes(item.id) ? { ...item, status } : item
      )
      localStorage.setItem('zaylo-admin-products', JSON.stringify(state.items))
    }
  }
})

export const {
  addProduct,
  editProduct,
  deleteProduct,
  toggleProductStatus,
  bulkDeleteProducts,
  bulkToggleProductStatus
} = productsSlice.actions

export default productsSlice.reducer
