import { baseApi, TAGS } from './baseApi'

const toQuery = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query({
      query: (params) => `/admin/notifications${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((n) => ({ type: TAGS.Notification, id: n.id })),
              { type: TAGS.Notification, id: 'LIST' },
            ]
          : [{ type: TAGS.Notification, id: 'LIST' }],
    }),
    markNotificationRead: build.mutation({
      query: (id) => ({
        url: `/admin/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: TAGS.Notification, id },
        { type: TAGS.Notification, id: 'LIST' },
      ],
    }),
    markAllNotificationsRead: build.mutation({
      query: () => ({
        url: '/admin/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: [{ type: TAGS.Notification, id: 'LIST' }],
    }),
    deleteNotification: build.mutation({
      query: (id) => ({
        url: `/admin/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: TAGS.Notification, id: 'LIST' }],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi
