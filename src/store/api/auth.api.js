import { baseApi, TAGS } from './baseApi'
import { setCredentials, setUser, setBootstrapped, logout } from '../slices/authSlice'
import { clearStoredToken } from '../../lib/tokenStorage'

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const payload = data.data
          dispatch(
            setCredentials({
              accessToken: payload.accessToken,
              user: payload.user,
            }),
          )
        } catch {
          /* login page handles error */
        }
      },
    }),
    getMe: build.query({
      query: () => '/auth/me',
      providesTags: [TAGS.Auth],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data.data))
        } catch {
          clearStoredToken()
          dispatch(logout())
          dispatch(setBootstrapped())
        }
      },
    }),
  }),
})

export const { useLoginMutation, useGetMeQuery, useLazyGetMeQuery } = authApi
