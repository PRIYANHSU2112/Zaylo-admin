import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Edit, Trash, Eye } from 'lucide-react'
import {
  addBlog,
  editBlog,
  deleteBlog,
  toggleBlogStatus,
  bulkDeleteBlogs,
  bulkToggleBlogStatus
} from '../../../store/slices/blogsSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input, Textarea } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function BlogsPage() {
  const dispatch = useDispatch()
  const blogs = useSelector(state => state.blogs.items)

  // Local States
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Form State
  const initialFormState = {
    id: '',
    title: '',
    excerpt: '',
    category: 'Manufacturing',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?q=80&w=800&auto=format&fit=crop',
    status: 'Published'
  }
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  // Apply filters
  const filteredBlogs = blogs.filter(b => {
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    return matchesCategory && matchesStatus
  })

  // Handlers
  const handleOpenAdd = () => {
    setFormValues(initialFormState)
    setFormErrors({})
    setIsEditing(false)
    setModalOpen(true)
  }

  const handleOpenEdit = (blog) => {
    setFormValues(blog)
    setFormErrors({})
    setIsEditing(true)
    setModalOpen(true)
  }

  const handleOpenDetails = (blog) => {
    setSelectedBlog(blog)
    setDetailsModalOpen(true)
  }

  const handleToggleStatus = (id) => {
    dispatch(toggleBlogStatus(id))
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      dispatch(deleteBlog(id))
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
    if (!formValues.excerpt.trim()) errors.excerpt = 'Excerpt description is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveBlog = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (isEditing) {
      dispatch(editBlog(formValues))
    } else {
      dispatch(addBlog(formValues))
    }
    setModalOpen(false)
  }

  // Categories derived for filtering
  const categoriesList = Array.from(new Set(blogs.map(b => b.category)))

  // Table Headers
  const headers = [
    {
      key: 'title',
      label: 'Article Details',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={row.title}
            className="w-12 h-8 object-cover rounded border border-border"
          />
          <div>
            <p className="font-semibold text-foreground line-clamp-1">{row.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.excerpt}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true
    },
    {
      key: 'date',
      label: 'Published Date',
      sortable: true
    },
    {
      key: 'readTime',
      label: 'Read Duration',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
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
            onClick={() => handleOpenDetails(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Read Article Preview"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Edit Article"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Article"
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
      label: 'Mark Published',
      action: (ids) => dispatch(bulkToggleBlogStatus({ ids, status: 'Published' })),
      variant: 'outline'
    },
    {
      label: 'Mark Draft',
      action: (ids) => dispatch(bulkToggleBlogStatus({ ids, status: 'Draft' })),
      variant: 'outline'
    },
    {
      label: 'Delete Articles',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} articles?`)) {
          dispatch(bulkDeleteBlogs(ids))
        }
      },
      variant: 'danger'
    }
  ]

  // Filters Markup
  const FiltersMarkup = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="py-2.5 px-3 min-w-[140px] text-xs h-10"
      >
        <option value="all">All Categories</option>
        {categoriesList.map((cat, idx) => (
          <option key={idx} value={cat}>{cat}</option>
        ))}
      </Select>
      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="py-2.5 px-3 min-w-[140px] text-xs h-10"
      >
        <option value="all">All Statuses</option>
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
      </Select>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Blogs CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Write, schedule, categorize, and publish marketing articles and news posts.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus size={18} /> Write Article
        </Button>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={filteredBlogs}
        searchPlaceholder="Search articles by title, excerpt, category, date..."
        filters={FiltersMarkup}
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={8}
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Blog Article' : 'Write New Article'}
        className="max-w-xl"
      >
        <form onSubmit={handleSaveBlog} className="space-y-4">
          <Input
            name="title"
            label="Article Title"
            placeholder="e.g. Zaylo Namkeen: The Crunch History"
            value={formValues.title}
            onChange={handleFormChange}
            error={formErrors.title}
            required
          />

          <Textarea
            name="excerpt"
            label="Excerpt Brief"
            placeholder="A short descriptive sentence to display in grid summaries..."
            value={formValues.excerpt}
            onChange={handleFormChange}
            error={formErrors.excerpt}
            required
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              name="category"
              label="Article Category"
              value={formValues.category}
              onChange={handleFormChange}
            >
              <option value="Manufacturing">Manufacturing</option>
              <option value="Recipes">Recipes</option>
              <option value="Company News">Company News</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Products">Products</option>
              <option value="Culture">Culture</option>
            </Select>

            <Input
              name="readTime"
              label="Read Duration Description"
              placeholder="e.g. 4 min read"
              value={formValues.readTime}
              onChange={handleFormChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-3">
            <Input
              name="image"
              label="Cover Image URL"
              value={formValues.image}
              onChange={handleFormChange}
            />
            <Select
              name="status"
              label="Publish Status"
              value={formValues.status}
              onChange={handleFormChange}
            >
              <option value="Published">Published (Live on site)</option>
              <option value="Draft">Draft (Offline)</option>
            </Select>
          </div>

          <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Article
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL PREVIEW MODAL */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedBlog?.title}
        className="max-w-xl"
      >
        {selectedBlog && (
          <div className="space-y-4 text-xs font-medium">
            <div className="flex justify-center bg-muted/30 p-2 rounded-xl border border-border">
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="max-h-[220px] object-cover w-full rounded-lg shadow-sm"
              />
            </div>
            
            <div className="flex justify-between items-center bg-muted/40 p-2.5 rounded-xl border border-border">
              <span>Category: <span className="font-bold text-foreground">{selectedBlog.category}</span></span>
              <span>Read Time: <span className="font-bold text-foreground">{selectedBlog.readTime}</span></span>
              <span>Date: <span className="font-bold text-foreground">{selectedBlog.date}</span></span>
            </div>

            <div className="bg-muted/10 border border-dashed border-border p-3.5 rounded-xl leading-relaxed text-sm text-foreground">
              <p className="font-bold mb-2">Excerpt:</p>
              <p className="italic font-normal">"{selectedBlog.excerpt}"</p>
              
              <p className="font-bold mt-4 mb-2">Body Content (CMS Mock):</p>
              <p className="font-normal leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>

            <div className="flex justify-end border-t border-border pt-4 mt-2">
              <Button onClick={() => setDetailsModalOpen(false)}>Close Preview</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
