import { createSlice } from '@reduxjs/toolkit'
import { getStoredToken, setStoredToken, clearStoredToken } from '../../lib/tokenStorage'

const initialState = {
  token: getStoredToken(),
  user: null,
  isAuthenticated: Boolean(getStoredToken()),
  bootstrapped: !getStoredToken(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { accessToken, user } = action.payload
      state.token = accessToken
      state.user = user
      state.isAuthenticated = true
      state.bootstrapped = true
      setStoredToken(accessToken)
    },
    setUser(state, action) {
      state.user = action.payload
      state.isAuthenticated = true
      state.bootstrapped = true
    },
    setBootstrapped(state) {
      state.bootstrapped = true
    },
    logout(state) {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.bootstrapped = true
      clearStoredToken()
    },
  },
})

export const { setCredentials, setUser, setBootstrapped, logout } = authSlice.actions
export default authSlice.reducer
