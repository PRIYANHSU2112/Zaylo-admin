import React, { useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from '../../../store/api/content.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input, Textarea } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

const CATEGORIES = ['Manufacturing', 'Recipes', 'Company News', 'Lifestyle', 'Products', 'Culture']

export default function BlogsPage() {
  const { data: env, isLoading, isError, error } = useGetBlogsQuery({ limit: 100 })
  const [createBlog, { isLoading: creating }] = useCreateBlogMutation()
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation()
  const [deleteBlog] = useDeleteBlogMutation()
  const blogs = env?.data || []

  const empty = {
    id: '',
    title: '',
    excerpt: '',
    category: 'Company News',
    date: '',
    readTime: '3 min',
    image: '',
    status: 'Draft',
  }
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(empty)
  const [formError, setFormError] = useState('')

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setFormError('Title is required')
      return
    }
    const body = {
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      date: form.date,
      readTime: form.readTime,
      image: form.image,
      status: form.status,
    }
    try {
      if (isEditing) await updateBlog({ id: form.id, ...body }).unwrap()
      else await createBlog(body).unwrap()
      setModalOpen(false)
    } catch (err) {
      setFormError(err?.data?.message || 'Failed to save')
    }
  }

  const headers = [
    {
      key: 'title',
      label: 'Post',
      sortable: true,
      render: (_v, row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted" />
          )}
          <div>
            <p className="font-semibold">{row.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.excerpt}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={val}>{val}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => {
              setForm(row)
              setIsEditing(true)
              setFormError('')
              setModalOpen(true)
            }}
            className="p-1.5 hover:text-primary cursor-pointer"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete blog?')) deleteBlog(row.id)
            }}
            className="p-1.5 hover:text-red-500 cursor-pointer"
          >
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (isLoading) return <PageSkeleton />
  if (isError) return <div className="text-sm font-bold text-rose-600">{error?.data?.message || 'Failed to load'}</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display">Blogs CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Publish stories and product content.</p>
        </div>
        <Button
          onClick={() => {
            setForm(empty)
            setIsEditing(false)
            setFormError('')
            setModalOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Add Post
        </Button>
      </div>

      <AdminTable headers={headers} data={blogs} searchPlaceholder="Search blogs..." idField="id" itemsPerPage={8} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Post' : 'New Post'} className="max-w-xl">
        <form onSubmit={save} className="space-y-4">
          {formError && <p className="text-xs font-bold text-rose-600">{formError}</p>}
          <Input name="title" label="Title" value={form.title} onChange={onChange} required />
          <Textarea name="excerpt" label="Excerpt" value={form.excerpt} onChange={onChange} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Select name="category" label="Category" value={form.category} onChange={onChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select name="status" label="Status" value={form.status} onChange={onChange}>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </Select>
          </div>
          <Input name="image" label="Image URL" value={form.image} onChange={onChange} />
          <Input name="readTime" label="Read Time" value={form.readTime} onChange={onChange} />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={creating || updating}>{creating || updating ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
