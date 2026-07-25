import React, { useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useSetCategoryStatusMutation,
  useDeleteCategoryMutation,
  useBulkCategoriesMutation,
} from '../../../store/api/catalog.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function CategoriesPage() {
  const { data: env, isLoading, isError, error } = useGetCategoriesQuery({ limit: 100 })
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation()
  const [setCategoryStatus] = useSetCategoryStatusMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [bulkCategories] = useBulkCategoriesMutation()

  const categories = env?.data || []
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const initialFormState = { id: '', name: '', color: 'from-brand-primary to-brand-orange', status: 'Active', comingSoon: false }
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  const handleOpenAddModal = () => {
    setFormValues(initialFormState)
    setFormErrors({})
    setIsEditing(false)
    setModalOpen(true)
  }

  const handleOpenEditModal = (cat) => {
    setFormValues(cat)
    setFormErrors({})
    setIsEditing(true)
    setModalOpen(true)
  }

  const handleToggleStatus = async (id, current) => {
    await setCategoryStatus({ id, status: current === 'Active' ? 'Inactive' : 'Active' })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) await deleteCategory(id)
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!formValues.name.trim()) {
      setFormErrors({ name: 'Category name is required' })
      return
    }
    const body = {
      name: formValues.name,
      color: formValues.color,
      status: formValues.status,
      comingSoon: formValues.status === 'Inactive' || formValues.comingSoon,
    }
    try {
      if (isEditing) await updateCategory({ id: formValues.id, ...body }).unwrap()
      else await createCategory(body).unwrap()
      setModalOpen(false)
    } catch (err) {
      setFormErrors({ name: err?.data?.message || 'Failed to save' })
    }
  }

  const headers = [
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">Slug: {row.slug}</p>
        </div>
      ),
    },
    {
      key: 'color',
      label: 'UI Skin Gradient',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className={`w-12 h-6 rounded bg-gradient-to-r ${val}`} />
          <span className="text-xs font-semibold font-mono text-muted-foreground">{val}</span>
        </div>
      ),
    },
    {
      key: 'comingSoon',
      label: 'Stage Status',
      sortable: true,
      render: (val) => (
        <span className={`text-xs font-bold ${val ? 'text-amber-500' : 'text-emerald-500'}`}>
          {val ? 'Coming Soon / Inactive' : 'Active on Site'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status Toggle',
      sortable: true,
      render: (val, row) => (
        <button onClick={() => handleToggleStatus(row.id, val)} className="cursor-pointer block" title="Toggle status">
          <Badge variant={val}>{val}</Badge>
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => handleOpenEditModal(row)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg cursor-pointer">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg cursor-pointer">
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ]

  const bulkActions = [
    {
      label: 'Delete Selected',
      action: (ids) => {
        if (confirm(`Delete ${ids.length} categories?`)) bulkCategories({ action: 'delete', ids })
      },
      variant: 'danger',
    },
  ]

  if (isLoading) return <PageSkeleton />
  if (isError) return <div className="text-sm font-bold text-rose-600">{error?.data?.message || 'Failed to load'}</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize snack catalog taxonomy and storefront visibility.</p>
        </div>
        <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
          <Plus size={18} /> Add Category
        </Button>
      </div>

      <AdminTable
        headers={headers}
        data={categories}
        searchPlaceholder="Search categories..."
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={10}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input name="name" label="Category Name" value={formValues.name} onChange={handleFormChange} error={formErrors.name} required />
          <Input name="color" label="Gradient Class" value={formValues.color} onChange={handleFormChange} />
          <Select name="status" label="Status" value={formValues.status} onChange={handleFormChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
