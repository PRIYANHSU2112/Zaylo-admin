import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '../config/env'
import { clearStoredToken } from './tokenStorage'
import { logout } from '../store/slices/authSlice'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth?.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    // Let the browser set multipart boundary for uploads
    if (endpoint === 'uploadFile') {
      headers.delete('Content-Type')
    }
    return headers
  },
})

export async function apiBaseQuery(args, api, extraOptions) {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error) {
    const status = result.error.status
    if (status === 401) {
      clearStoredToken()
      api.dispatch(logout())
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.assign('/login')
      }
    }

    const body = result.error.data
    const message =
      (body && typeof body === 'object' && body.message) ||
      result.error.error ||
      'Request failed'

    return {
      error: {
        status,
        data: {
          message,
          error: body?.error ?? null,
          details: body?.error?.details ?? null,
        },
      },
    }
  }

  const envelope = result.data
  if (envelope && typeof envelope === 'object' && 'success' in envelope) {
    if (!envelope.success) {
      return {
        error: {
          status: result.meta?.response?.status ?? 400,
          data: {
            message: envelope.message || 'Request failed',
            error: envelope.error,
          },
        },
      }
    }
    return {
      data: {
        data: envelope.data,
        meta: envelope.meta ?? null,
        message: envelope.message,
      },
    }
  }

  return { data: { data: envelope, meta: null, message: 'OK' } }
}
