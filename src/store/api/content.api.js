import { baseApi, TAGS } from './baseApi'

const toQuery = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const contentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBlogs: build.query({
      query: (params) => `/admin/blogs${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((b) => ({ type: TAGS.Blog, id: b.id })),
              { type: TAGS.Blog, id: 'LIST' },
            ]
          : [{ type: TAGS.Blog, id: 'LIST' }],
    }),
    createBlog: build.mutation({
      query: (body) => ({ url: '/admin/blogs', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Blog, id: 'LIST' }],
    }),
    updateBlog: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/blogs/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Blog, id: arg.id },
        { type: TAGS.Blog, id: 'LIST' },
      ],
    }),
    deleteBlog: build.mutation({
      query: (id) => ({ url: `/admin/blogs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Blog, id: 'LIST' }],
    }),
    getGallery: build.query({
      query: (params) => `/admin/gallery${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((g) => ({ type: TAGS.Gallery, id: g.id })),
              { type: TAGS.Gallery, id: 'LIST' },
            ]
          : [{ type: TAGS.Gallery, id: 'LIST' }],
    }),
    createGalleryItem: build.mutation({
      query: (body) => ({ url: '/admin/gallery', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Gallery, id: 'LIST' }],
    }),
    updateGalleryItem: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/gallery/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Gallery, id: arg.id },
        { type: TAGS.Gallery, id: 'LIST' },
      ],
    }),
    deleteGalleryItem: build.mutation({
      query: (id) => ({ url: `/admin/gallery/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Gallery, id: 'LIST' }],
    }),
    getAnnouncements: build.query({
      query: () => '/admin/announcements',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((a) => ({ type: TAGS.Announcement, id: a.id })),
              { type: TAGS.Announcement, id: 'LIST' },
            ]
          : [{ type: TAGS.Announcement, id: 'LIST' }],
    }),
    createAnnouncement: build.mutation({
      query: (body) => ({ url: '/admin/announcements', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Announcement, id: 'LIST' }],
    }),
    updateAnnouncement: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/announcements/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Announcement, id: arg.id },
        { type: TAGS.Announcement, id: 'LIST' },
      ],
    }),
    deleteAnnouncement: build.mutation({
      query: (id) => ({ url: `/admin/announcements/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Announcement, id: 'LIST' }],
    }),
    getPromos: build.query({
      query: () => '/admin/promos',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: TAGS.Promo, id: p.id })),
              { type: TAGS.Promo, id: 'LIST' },
            ]
          : [{ type: TAGS.Promo, id: 'LIST' }],
    }),
    createPromo: build.mutation({
      query: (body) => ({ url: '/admin/promos', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Promo, id: 'LIST' }],
    }),
    updatePromo: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/promos/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.Promo, id: arg.id },
        { type: TAGS.Promo, id: 'LIST' },
      ],
    }),
    deletePromo: build.mutation({
      query: (id) => ({ url: `/admin/promos/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.Promo, id: 'LIST' }],
    }),
    getSettings: build.query({
      query: () => '/admin/settings',
      providesTags: [TAGS.Settings],
    }),
    updateSettings: build.mutation({
      query: (body) => ({ url: '/admin/settings', method: 'PATCH', body }),
      invalidatesTags: [TAGS.Settings],
    }),
    getCms: build.query({
      query: () => '/admin/cms',
      providesTags: [TAGS.Cms],
    }),
    updateCms: build.mutation({
      query: (body) => ({ url: '/admin/cms', method: 'PATCH', body }),
      invalidatesTags: [TAGS.Cms],
    }),
    getUsers: build.query({
      query: (params) => `/admin/users${toQuery(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((u) => ({ type: TAGS.User, id: u.id })),
              { type: TAGS.User, id: 'LIST' },
            ]
          : [{ type: TAGS.User, id: 'LIST' }],
    }),
    createUser: build.mutation({
      query: (body) => ({ url: '/admin/users', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.User, id: 'LIST' }],
    }),
    updateUser: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAGS.User, id: arg.id },
        { type: TAGS.User, id: 'LIST' },
      ],
    }),
    deleteUser: build.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: TAGS.User, id: 'LIST' }],
    }),
    bulkUsers: build.mutation({
      query: (body) => ({ url: '/admin/users/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.User, id: 'LIST' }],
    }),
  }),
})

export const {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetGalleryQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetPromosQuery,
  useCreatePromoMutation,
  useUpdatePromoMutation,
  useDeletePromoMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetCmsQuery,
  useUpdateCmsMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkUsersMutation,
} = contentApi
