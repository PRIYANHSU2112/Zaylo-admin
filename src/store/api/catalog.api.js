import { baseApi, TAGS } from './baseApi'

const toQuery = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query({
      query: (params) => `/admin/products${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: TAGS.Product, id: p.id })),
              { type: TAGS.Product, id: 'LIST' },
            ]
          : [{ type: TAGS.Product, id: 'LIST' }],
    }),
    createProduct: build.mutation({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Product, id: 'LIST' }, TAGS.Dashboard],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Product, id: arg.id },
        { type: TAGS.Product, id: 'LIST' },
        TAGS.Dashboard,
      ],
    }),
    setProductStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/admin/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Product, id: arg.id },
        { type: TAGS.Product, id: 'LIST' },
      ],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Product, id: 'LIST' }, TAGS.Dashboard],
    }),
    bulkProducts: build.mutation({
      query: (body) => ({ url: '/admin/products/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Product, id: 'LIST' }, TAGS.Dashboard],
    }),
    getCategories: build.query({
      query: (params) => `/admin/categories${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((c) => ({ type: TAGS.Category, id: c.id })),
              { type: TAGS.Category, id: 'LIST' },
            ]
          : [{ type: TAGS.Category, id: 'LIST' }],
    }),
    createCategory: build.mutation({
      query: (body) => ({ url: '/admin/categories', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Category, id: 'LIST' }],
    }),
    updateCategory: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Category, id: arg.id },
        { type: TAGS.Category, id: 'LIST' },
      ],
    }),
    setCategoryStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/admin/categories/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Category, id: arg.id },
        { type: TAGS.Category, id: 'LIST' },
      ],
    }),
    deleteCategory: build.mutation({
      query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Category, id: 'LIST' }],
    }),
    bulkCategories: build.mutation({
      query: (body) => ({ url: '/admin/categories/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Category, id: 'LIST' }],
    }),
    uploadFile: build.mutation({
      query: ({ file, folder = 'uploads' }) => {
        const body = new FormData()
        body.append('file', file)
        body.append('folder', folder)
        return { url: '/admin/uploads', method: 'POST', body }
      },
    }),
  }),
})

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSetProductStatusMutation,
  useDeleteProductMutation,
  useBulkProductsMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useSetCategoryStatusMutation,
  useDeleteCategoryMutation,
  useBulkCategoriesMutation,
  useUploadFileMutation,
} = catalogApi
