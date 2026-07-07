import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Edit, Trash, HelpCircle } from 'lucide-react'
import {
  addCategory,
  editCategory,
  deleteCategory,
  toggleCategoryStatus,
  bulkDeleteCategories
} from '../../../store/slices/categoriesSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function CategoriesPage() {
  const dispatch = useDispatch()
  const categories = useSelector(state => state.categories.items)

  // Local Component States
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form State
  const initialFormState = {
    id: '',
    name: '',
    color: 'from-brand-primary to-brand-orange',
    status: 'Active',
    comingSoon: false
  }
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  // Handlers
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

  const handleToggleStatus = (id) => {
    dispatch(toggleCategoryStatus(id))
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this category? All associated products may be uncategorized.')) {
      dispatch(deleteCategory(id))
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formValues.name.trim()) errors.name = 'Category name is required'
    if (!formValues.color.trim()) errors.color = 'Gradient color class is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveCategory = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const processedCat = {
      ...formValues,
      comingSoon: formValues.status === 'Inactive'
    }

    if (isEditing) {
      dispatch(editCategory(processedCat))
    } else {
      dispatch(addCategory(processedCat))
    }
    setModalOpen(false)
  }

  // Define Table Headers
  const headers = [
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">ID: {row.id}</p>
        </div>
      )
    },
    {
      key: 'color',
      label: 'UI Skin Gradient',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className={`w-12 h-6 rounded bg-gradient-to-r ${val}`} />
          <span className="text-xs font-semibold font-mono text-muted-foreground">{val}</span>
        </div>
      )
    },
    {
      key: 'comingSoon',
      label: 'Stage Status',
      sortable: true,
      render: (val) => (
        <span className={`text-xs font-bold ${val ? 'text-amber-500' : 'text-emerald-500'}`}>
          {val ? 'Coming Soon / Inactive' : 'Active on Site'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status Toggle',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className="cursor-pointer transition-transform active:scale-95 block"
          title="Click to toggle status"
        >
          <Badge variant={val}>{val}</Badge>
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Edit Category"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Category"
          >
            <Trash size={16} />
          </button>
        </div>
      )
    }
  ]

  // Bulk Actions configs
  const bulkActions = [
    {
      label: 'Delete Selected',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} categories?`)) {
          dispatch(bulkDeleteCategories(ids))
        }
      },
      variant: 'danger'
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Categories Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure retail categories, gradients, and toggling Coming Soon statuses.</p>
        </div>
        <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
          <Plus size={18} /> Add Category
        </Button>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={categories}
        searchPlaceholder="Search categories by name, slug, gradients..."
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={10}
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            name="name"
            label="Category Name"
            placeholder="e.g. Crispy Chips"
            value={formValues.name}
            onChange={handleFormChange}
            error={formErrors.name}
            required
          />

          <Input
            name="color"
            label="Gradient Color Classes (Tailwind)"
            placeholder="from-brand-primary to-brand-orange"
            value={formValues.color}
            onChange={handleFormChange}
            error={formErrors.color}
            required
          />

          <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-xl text-xs text-muted-foreground">
            <HelpCircle size={16} className="text-primary shrink-0" />
            <p>Example gradients: <code className="font-bold text-foreground">from-brand-primary to-brand-orange</code>, <code className="font-bold text-foreground">from-blue-400 to-brand-primary</code>, or <code className="font-bold text-foreground">from-brand-yellow to-pink-400</code>.</p>
          </div>

          <Select
            name="status"
            label="Status"
            value={formValues.status}
            onChange={handleFormChange}
          >
            <option value="Active">Active (Live on store)</option>
            <option value="Inactive">Inactive (Coming Soon / Hidden)</option>
          </Select>

          <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
