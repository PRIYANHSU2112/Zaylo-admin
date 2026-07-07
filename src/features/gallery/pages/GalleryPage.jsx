import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Edit, Trash, Eye } from 'lucide-react'
import {
  addGalleryImage,
  editGalleryImage,
  deleteGalleryImage,
  bulkDeleteGalleryImages
} from '../../../store/slices/gallerySlice'
import Button from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function GalleryPage() {
  const dispatch = useDispatch()
  const gallery = useSelector(state => state.gallery.items)

  // Local States
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Form State
  const initialFormState = {
    id: '',
    title: '',
    category: 'Products',
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800&auto=format&fit=crop'
  }
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  // Apply filters
  const filteredGallery = gallery.filter(g => {
    return categoryFilter === 'all' || g.category === categoryFilter
  })

  // Handlers
  const handleOpenAdd = () => {
    setFormValues(initialFormState)
    setFormErrors({})
    setIsEditing(false)
    setModalOpen(true)
  }

  const handleOpenEdit = (img) => {
    setFormValues(img)
    setFormErrors({})
    setIsEditing(true)
    setModalOpen(true)
  }

  const handleOpenPreview = (img) => {
    setSelectedImage(img)
    setPreviewModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this gallery photo?')) {
      dispatch(deleteGalleryImage(id))
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormValues(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formValues.title.trim()) errors.title = 'Title is required'
    if (!formValues.url.trim()) errors.url = 'Image URL is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveImage = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (isEditing) {
      dispatch(editGalleryImage(formValues))
    } else {
      dispatch(addGalleryImage(formValues))
    }
    setModalOpen(false)
  }

  // Table Headers
  const headers = [
    {
      key: 'url',
      label: 'Image Preview',
      render: (val, row) => (
        <div className="w-20 h-12 bg-muted rounded overflow-hidden border border-border flex items-center justify-center cursor-pointer" onClick={() => handleOpenPreview(row)}>
          <img
            src={val}
            alt={row.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
          />
        </div>
      )
    },
    {
      key: 'title',
      label: 'Asset Title',
      sortable: true,
      render: (val) => <span className="font-semibold text-foreground">{val}</span>
    },
    {
      key: 'category',
      label: 'Category Tag',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded border border-border text-muted-foreground capitalize">
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleOpenPreview(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Preview Photo"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Edit Asset"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Asset"
          >
            <Trash size={16} />
          </button>
        </div>
      )
    }
  ]

  // Bulk actions
  const bulkActions = [
    {
      label: 'Delete Assets',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} gallery images?`)) {
          dispatch(bulkDeleteGalleryImages(ids))
        }
      },
      variant: 'danger'
    }
  ]

  // Filters Markup
  const FiltersMarkup = (
    <Select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="py-2.5 px-3 min-w-[140px] text-xs h-10"
    >
      <option value="all">All Categories</option>
      <option value="Products">Products</option>
      <option value="Factory">Factory / Plant</option>
      <option value="Events">Dealer Events</option>
    </Select>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Gallery CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage factory, product, and dealer meet assets that display in the media gallery.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus size={18} /> Add Photo Asset
        </Button>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={filteredGallery}
        searchPlaceholder="Search photos by title, category, URL..."
        filters={FiltersMarkup}
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={8}
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Photo Asset' : 'Upload Gallery Photo'}
      >
        <form onSubmit={handleSaveImage} className="space-y-4">
          <Input
            name="title"
            label="Photo Caption / Title"
            placeholder="e.g. Automated Packaging Machine"
            value={formValues.title}
            onChange={handleFormChange}
            error={formErrors.title}
            required
          />

          <Select
            name="category"
            label="Gallery Album"
            value={formValues.category}
            onChange={handleFormChange}
          >
            <option value="Products">Products</option>
            <option value="Factory">Factory</option>
            <option value="Events">Events</option>
          </Select>

          <Input
            name="url"
            label="Image URL Address"
            placeholder="https://images.unsplash.com/photo-..."
            value={formValues.url}
            onChange={handleFormChange}
            error={formErrors.url}
            required
          />

          <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Photo Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAILS VIEW / PREVIEW MODAL */}
      <Modal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={selectedImage?.title}
      >
        {selectedImage && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-center bg-muted/20 p-1.5 rounded-xl border border-border">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[300px] object-cover w-full rounded-lg"
              />
            </div>
            
            <div className="flex justify-between items-center bg-muted/40 p-2.5 rounded-xl border border-border">
              <span>Category: <span className="font-bold text-foreground">{selectedImage.category}</span></span>
              <span>Asset ID: <span className="font-bold text-foreground">{selectedImage.id}</span></span>
            </div>

            <div className="flex justify-end border-t border-border pt-4 mt-2">
              <Button onClick={() => setPreviewModalOpen(false)}>Close Preview</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
