import { baseApi, TAGS } from './baseApi'

const toQuery = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const opsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query({
      query: (params) => `/admin/dashboard${toQuery(params || {})}`,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { range = '30d', from = '', to = '' } = queryArgs || {}
        return `${endpointName}-${range}-${from}-${to}`
      },
      keepUnusedDataFor: 60,
      providesTags: [TAGS.Dashboard],
    }),
    getOrders: build.query({
      query: (params) => `/admin/orders${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((o) => ({ type: TAGS.Order, id: o.id })),
              { type: TAGS.Order, id: 'LIST' },
            ]
          : [{ type: TAGS.Order, id: 'LIST' }],
    }),
    setOrderStatus: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Order, id: arg.id },
        { type: TAGS.Order, id: 'LIST' },
        { type: TAGS.Product, id: 'LIST' },
        TAGS.Dashboard,
      ],
    }),
    // Payment status is separate from fulfilment status (COD collected after dispatch).
    setOrderPayment: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}/payment`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Order, id: arg.id },
        { type: TAGS.Order, id: 'LIST' },
        TAGS.Dashboard,
      ],
    }),
    getCoupons: build.query({
      query: (params) => `/admin/coupons${toQuery(params)}`,
      providesTags: [{ type: TAGS.Coupon, id: 'LIST' }],
    }),
    createCoupon: build.mutation({
      query: (body) => ({ url: '/admin/coupons', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Coupon, id: 'LIST' }],
    }),
    updateCoupon: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/coupons/${id}`, method: 'PATCH', body }),
      invalidatesTags: [{ type: TAGS.Coupon, id: 'LIST' }],
    }),
    deleteCoupon: build.mutation({
      query: (id) => ({ url: `/admin/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Coupon, id: 'LIST' }],
    }),
    deleteOrder: build.mutation({
      query: (id) => ({ url: `/admin/orders/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Order, id: 'LIST' }, TAGS.Dashboard],
    }),
    bulkOrders: build.mutation({
      query: (body) => ({ url: '/admin/orders/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Order, id: 'LIST' }, TAGS.Dashboard],
    }),
    getDealers: build.query({
      query: (params) => `/admin/dealers${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((d) => ({ type: TAGS.Dealer, id: d.id })),
              { type: TAGS.Dealer, id: 'LIST' },
            ]
          : [{ type: TAGS.Dealer, id: 'LIST' }],
    }),
    setDealerStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/admin/dealers/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Dealer, id: arg.id },
        { type: TAGS.Dealer, id: 'LIST' },
        TAGS.Dashboard,
      ],
    }),
    deleteDealer: build.mutation({
      query: (id) => ({ url: `/admin/dealers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Dealer, id: 'LIST' }, TAGS.Dashboard],
    }),
    bulkDealers: build.mutation({
      query: (body) => ({ url: '/admin/dealers/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Dealer, id: 'LIST' }, TAGS.Dashboard],
    }),
    getBulkOrders: build.query({
      query: (params) => `/admin/bulk-orders${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((b) => ({ type: TAGS.BulkOrder, id: b.id })),
              { type: TAGS.BulkOrder, id: 'LIST' },
            ]
          : [{ type: TAGS.BulkOrder, id: 'LIST' }],
    }),
    setBulkOrderStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/admin/bulk-orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.BulkOrder, id: arg.id },
        { type: TAGS.BulkOrder, id: 'LIST' },
        TAGS.Dashboard,
      ],
    }),
    deleteBulkOrder: build.mutation({
      query: (id) => ({ url: `/admin/bulk-orders/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.BulkOrder, id: 'LIST' }, TAGS.Dashboard],
    }),
    bulkBulkOrders: build.mutation({
      query: (body) => ({ url: '/admin/bulk-orders/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.BulkOrder, id: 'LIST' }, TAGS.Dashboard],
    }),
    getContacts: build.query({
      query: (params) => `/admin/contacts${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((c) => ({ type: TAGS.Contact, id: c.id })),
              { type: TAGS.Contact, id: 'LIST' },
            ]
          : [{ type: TAGS.Contact, id: 'LIST' }],
    }),
    getContact: build.query({
      query: (id) => `/admin/contacts/${id}`,
      providesTags: (_r, _e, id) => [{ type: TAGS.Contact, id }],
    }),
    setContactStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/admin/contacts/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Contact, id: arg.id },
        { type: TAGS.Contact, id: 'LIST' },
        TAGS.Dashboard,
      ],
    }),
    deleteContact: build.mutation({
      query: (id) => ({ url: `/admin/contacts/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Contact, id: 'LIST' }, TAGS.Dashboard],
    }),
    bulkContacts: build.mutation({
      query: (body) => ({ url: '/admin/contacts/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Contact, id: 'LIST' }, TAGS.Dashboard],
    }),
  }),
})

export const {
  useGetDashboardQuery,
  useGetOrdersQuery,
  useSetOrderPaymentMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useSetOrderStatusMutation,
  useDeleteOrderMutation,
  useBulkOrdersMutation,
  useGetDealersQuery,
  useSetDealerStatusMutation,
  useDeleteDealerMutation,
  useBulkDealersMutation,
  useGetBulkOrdersQuery,
  useSetBulkOrderStatusMutation,
  useDeleteBulkOrderMutation,
  useBulkBulkOrdersMutation,
  useGetContactsQuery,
  useGetContactQuery,
  useSetContactStatusMutation,
  useDeleteContactMutation,
  useBulkContactsMutation,
} = opsApi
