import React, { useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'
import {
  useGetGalleryQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} from '../../../store/api/content.api'
import Button from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function GalleryPage() {
  const { data: env, isLoading, isError, error } = useGetGalleryQuery({ limit: 100 })
  const [createItem, { isLoading: creating }] = useCreateGalleryItemMutation()
  const [updateItem, { isLoading: updating }] = useUpdateGalleryItemMutation()
  const [deleteItem] = useDeleteGalleryItemMutation()
  const items = env?.data || []

  const empty = { id: '', url: '', title: '', category: 'Products' }
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(empty)
  const [formError, setFormError] = useState('')

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.url.trim() || !form.title.trim()) {
      setFormError('URL and title are required')
      return
    }
    try {
      const body = { url: form.url, title: form.title, category: form.category }
      if (isEditing) await updateItem({ id: form.id, ...body }).unwrap()
      else await createItem(body).unwrap()
      setModalOpen(false)
    } catch (err) {
      setFormError(err?.data?.message || 'Failed to save')
    }
  }

  const headers = [
    {
      key: 'url',
      label: 'Image',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img src={val} alt={row.title} className="w-12 h-12 rounded-lg object-cover border border-border" />
          <p className="font-semibold">{row.title}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Category', sortable: true },
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
              if (confirm('Delete image?')) deleteItem(row.id)
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
          <h1 className="text-3xl font-extrabold font-display">Gallery CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage storefront gallery media.</p>
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
          <Plus size={18} /> Add Image
        </Button>
      </div>

      <AdminTable headers={headers} data={items} searchPlaceholder="Search gallery..." idField="id" itemsPerPage={8} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Image' : 'Add Image'}>
        <form onSubmit={save} className="space-y-4">
          {formError && <p className="text-xs font-bold text-rose-600">{formError}</p>}
          <Input name="title" label="Title" value={form.title} onChange={onChange} required />
          <Input name="url" label="Image URL" value={form.url} onChange={onChange} required />
          <Select name="category" label="Category" value={form.category} onChange={onChange}>
            <option value="Products">Products</option>
            <option value="Factory">Factory</option>
            <option value="Events">Events</option>
          </Select>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={creating || updating}>{creating || updating ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
