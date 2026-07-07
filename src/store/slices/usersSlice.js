import { createSlice } from '@reduxjs/toolkit'

const INITIAL_USERS = [
  {
    id: 'USR-001',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+91 98765 43210',
    role: 'Customer',
    status: 'Active',
    dateJoined: '2026-05-10T08:00:00Z'
  },
  {
    id: 'USR-002',
    name: 'Admin User',
    email: 'admin@zaylosnacks.com',
    phone: '+91 99999 88888',
    role: 'Admin',
    status: 'Active',
    dateJoined: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR-003',
    name: 'Rajesh Kumar',
    email: 'rajesh@kumarfmcg.com',
    phone: '+91 98765 43210',
    role: 'Distributor',
    status: 'Active',
    dateJoined: '2026-06-15T10:00:00Z'
  },
  {
    id: 'USR-004',
    name: 'Amit Patel',
    email: 'amit.patel@patelagencies.com',
    phone: '+91 99223 11223',
    role: 'Distributor',
    status: 'Active',
    dateJoined: '2026-06-28T14:30:00Z'
  },
  {
    id: 'USR-005',
    name: 'Karan Malhotra',
    email: 'karan.m@zaylosnacks.com',
    phone: '+91 95555 44444',
    role: 'Manager',
    status: 'Active',
    dateJoined: '2026-03-12T09:00:00Z'
  }
]

const loadInitialState = () => {
  const saved = localStorage.getItem('zaylo-admin-users')
  const savedRole = localStorage.getItem('zaylo-admin-current-role')
  const auth = localStorage.getItem('zaylo-admin-auth') === 'true'
  return {
    items: saved ? JSON.parse(saved) : INITIAL_USERS,
    isAuthenticated: auth,
    currentUser: {
      name: savedRole === 'Manager' ? 'Karan Malhotra' : 'Admin User',
      email: savedRole === 'Manager' ? 'karan.m@zaylosnacks.com' : 'admin@zaylosnacks.com',
      role: savedRole || 'Admin'
    }
  }
}

const usersSlice = createSlice({
  name: 'users',
  initialState: loadInitialState(),
  reducers: {
    addUser: (state, action) => {
      const newUser = {
        ...action.payload,
        id: 'USR-' + Math.floor(100 + Math.random() * 900),
        dateJoined: new Date().toISOString()
      }
      state.items.push(newUser)
      localStorage.setItem('zaylo-admin-users', JSON.stringify(state.items))
    },
    editUser: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload }
        localStorage.setItem('zaylo-admin-users', JSON.stringify(state.items))
      }
    },
    deleteUser: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      localStorage.setItem('zaylo-admin-users', JSON.stringify(state.items))
    },
    toggleUserStatus: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload)
      if (index !== -1) {
        state.items[index].status = state.items[index].status === 'Active' ? 'Suspended' : 'Active'
        localStorage.setItem('zaylo-admin-users', JSON.stringify(state.items))
      }
    },
    switchCurrentRole: (state, action) => {
      state.currentUser.role = action.payload
      state.currentUser.name = action.payload === 'Manager' ? 'Karan Malhotra' : 'Admin User'
      state.currentUser.email = action.payload === 'Manager' ? 'karan.m@zaylosnacks.com' : 'admin@zaylosnacks.com'
      localStorage.setItem('zaylo-admin-current-role', action.payload)
    },
    login: (state, action) => {
      const { email, role } = action.payload
      state.isAuthenticated = true
      state.currentUser = {
        name: role === 'Manager' ? 'Karan Malhotra' : 'Admin User',
        email: email || (role === 'Manager' ? 'karan.m@zaylosnacks.com' : 'admin@zaylosnacks.com'),
        role: role || 'Admin'
      }
      localStorage.setItem('zaylo-admin-auth', 'true')
      localStorage.setItem('zaylo-admin-current-role', state.currentUser.role)
    },
    logout: (state) => {
      state.isAuthenticated = false
      localStorage.removeItem('zaylo-admin-auth')
    },
    bulkDeleteUsers: (state, action) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id))
      localStorage.setItem('zaylo-admin-users', JSON.stringify(state.items))
    },
    bulkToggleUserStatus: (state, action) => {
      const { ids, status } = action.payload
      state.items = state.items.map(item => 
        ids.includes(item.id) ? { ...item, status } : item
      )
      localStorage.setItem('zaylo-admin-users', JSON.stringify(state.items))
    }
  }
})

export const {
  addUser,
  editUser,
  deleteUser,
  toggleUserStatus,
  switchCurrentRole,
  login,
  logout,
  bulkDeleteUsers,
  bulkToggleUserStatus
} = usersSlice.actions

export default usersSlice.reducer
