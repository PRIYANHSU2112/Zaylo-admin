import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '../config/env'
import { clearStoredToken } from './tokenStorage'
import { logout } from '../store/slices/authSlice'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint, type, ...rest }) => {
    const token = getState().auth?.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

export async function apiBaseQuery(args, api, extraOptions) {
  // Ensure FormData uploads are not forced to application/json
  const preparedArgs =
    args && typeof args === 'object' && args.body instanceof FormData
      ? { ...args, headers: { ...(args.headers || {}) } }
      : args

  if (preparedArgs?.body instanceof FormData && preparedArgs.headers) {
    delete preparedArgs.headers['Content-Type']
  }

  const result = await rawBaseQuery(preparedArgs, api, extraOptions)

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
