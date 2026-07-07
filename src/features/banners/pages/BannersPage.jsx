import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Edit, Trash } from 'lucide-react'
import {
  addAnnouncement,
  editAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  addPromo,
  editPromo,
  deletePromo,
  togglePromoStatus
} from '../../../store/slices/bannersSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import { cn } from '../../../utils/cn'

export default function BannersPage() {
  const dispatch = useDispatch()
  const { announcements, promos } = useSelector(state => state.banners)

  // Local States
  const [activeTab, setActiveTab] = useState('announcements') // 'announcements' | 'promos'
  const [annModalOpen, setAnnModalOpen] = useState(false)
  const [promoModalOpen, setPromoModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form States
  const initialAnnForm = { id: '', text: '', link: '/products', status: 'Active' }
  const initialPromoForm = {
    id: '',
    title: '',
    subtitle: '',
    cta: 'Shop Now',
    link: '/products',
    gradient: 'from-brand-primary via-brand-primary-dark to-surface-dark',
    badge: 'Limited Time',
    status: 'Active'
  }

  const [annFormValues, setAnnFormValues] = useState(initialAnnForm)
  const [promoFormValues, setPromoFormValues] = useState(initialPromoForm)
  const [formErrors, setFormErrors] = useState({})

  // Handlers for Announcements
  const handleOpenAddAnn = () => {
    setAnnFormValues(initialAnnForm)
    setFormErrors({})
    setIsEditing(false)
    setAnnModalOpen(true)
  }

  const handleOpenEditAnn = (ann) => {
    setAnnFormValues(ann)
    setFormErrors({})
    setIsEditing(true)
    setAnnModalOpen(true)
  }

  const handleToggleAnnStatus = (id) => {
    dispatch(toggleAnnouncementStatus(id))
  }

  const handleDeleteAnn = (id) => {
    if (confirm('Are you sure you want to delete this announcement bar?')) {
      dispatch(deleteAnnouncement(id))
    }
  }

  const handleAnnSave = (e) => {
    e.preventDefault()
    if (!annFormValues.text.trim()) {
      setFormErrors({ text: 'Announcement text is required' })
      return
    }
    if (isEditing) {
      dispatch(editAnnouncement(annFormValues))
    } else {
      dispatch(addAnnouncement(annFormValues))
    }
    setAnnModalOpen(false)
  }

  // Handlers for Promos
  const handleOpenAddPromo = () => {
    setPromoFormValues(initialPromoForm)
    setFormErrors({})
    setIsEditing(false)
    setPromoModalOpen(true)
  }

  const handleOpenEditPromo = (promo) => {
    setPromoFormValues(promo)
    setFormErrors({})
    setIsEditing(true)
    setPromoModalOpen(true)
  }

  const handleTogglePromoStatus = (id) => {
    dispatch(togglePromoStatus(id))
  }

  const handleDeletePromo = (id) => {
    if (confirm('Are you sure you want to delete this promotional banner?')) {
      dispatch(deletePromo(id))
    }
  }

  const handlePromoSave = (e) => {
    e.preventDefault()
    const errors = {}
    if (!promoFormValues.title.trim()) errors.title = 'Title is required'
    if (!promoFormValues.subtitle.trim()) errors.subtitle = 'Subtitle is required'
    if (!promoFormValues.gradient.trim()) errors.gradient = 'Gradient class is required'
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    if (isEditing) {
      dispatch(editPromo(promoFormValues))
    } else {
      dispatch(addPromo(promoFormValues))
    }
    setPromoModalOpen(false)
  }

  // Announcement Table Configuration
  const annHeaders = [
    {
      key: 'text',
      label: 'Campaign Announcement Banner Content',
      sortable: true,
      render: (val) => <span className="font-semibold text-foreground">{val}</span>
    },
    {
      key: 'link',
      label: 'Target Action Link',
      sortable: true,
      render: (val) => <span className="font-mono text-xs text-muted-foreground">{val}</span>
    },
    {
      key: 'status',
      label: 'Status Toggle',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleToggleAnnStatus(row.id)}
          className="cursor-pointer transition-transform active:scale-95 block"
          title="Toggle Status"
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
            onClick={() => handleOpenEditAnn(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Edit Banner"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteAnn(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Banner"
          >
            <Trash size={16} />
          </button>
        </div>
      )
    }
  ]

  // Promo Cards Table Configuration
  const promoHeaders = [
    {
      key: 'title',
      label: 'Promo Banner Details',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{row.subtitle}</p>
        </div>
      )
    },
    {
      key: 'badge',
      label: 'Accent Tag',
      render: (val) => val ? <Badge variant="warning">{val}</Badge> : <span className="text-muted-foreground">-</span>
    },
    {
      key: 'gradient',
      label: 'Gradient Skin UI',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className={`w-16 h-8 rounded bg-gradient-to-r ${val}`} />
          <span className="text-[10px] font-mono text-muted-foreground">{val}</span>
        </div>
      )
    },
    {
      key: 'cta',
      label: 'CTA Link',
      render: (val, row) => (
        <div>
          <p className="text-xs font-bold text-foreground">CTA: {val}</p>
          <p className="text-[10px] text-muted-foreground font-mono">Link: {row.link}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status Toggle',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleTogglePromoStatus(row.id)}
          className="cursor-pointer transition-transform active:scale-95 block"
          title="Toggle Status"
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
            onClick={() => handleOpenEditPromo(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Edit Card"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeletePromo(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Card"
          >
            <Trash size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Promo Banners & announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure announcement bars, seasonal promo cards, and home page discount badges.</p>
        </div>
        <Button
          onClick={activeTab === 'announcements' ? handleOpenAddAnn : handleOpenAddPromo}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> {activeTab === 'announcements' ? 'Add Announcement' : 'Add Promo Card'}
        </Button>
      </div>

      {/* Tabs Layout controls */}
      <div className="flex border-b border-border gap-1.5 mb-2">
        <button
          onClick={() => setActiveTab('announcements')}
          className={cn(
            'px-5 py-2.5 font-display text-sm font-semibold transition-all border-b-2 cursor-pointer',
            activeTab === 'announcements'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Announcements Header-Bars
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={cn(
            'px-5 py-2.5 font-display text-sm font-semibold transition-all border-b-2 cursor-pointer',
            activeTab === 'promos'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Promotional Campaign Cards
        </button>
      </div>

      {/* Tables depending on tab selection */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'announcements' ? (
          <AdminTable
            headers={annHeaders}
            data={announcements}
            searchPlaceholder="Search announcement text, target link..."
            idField="id"
            itemsPerPage={6}
          />
        ) : (
          <AdminTable
            headers={promoHeaders}
            data={promos}
            searchPlaceholder="Search promo titles, subtitles, gradients, badges..."
            idField="id"
            itemsPerPage={6}
          />
        )}
      </div>

      {/* ANNOUNCEMENT ADD / EDIT MODAL */}
      <Modal
        open={annModalOpen}
        onClose={() => setAnnModalOpen(false)}
        title={isEditing ? 'Edit Announcement' : 'Add Announcement Bar'}
      >
        <form onSubmit={handleAnnSave} className="space-y-4">
          <Input
            name="text"
            label="Announcement Banner Text"
            placeholder="🎉 Festival Offer — Buy 10 Get 2 Free on all ZAY'LO products!"
            value={annFormValues.text}
            onChange={(e) => setAnnFormValues(prev => ({ ...prev, text: e.target.value }))}
            error={formErrors.text}
            required
          />

          <Input
            name="link"
            label="Fulfillment Redirect Link"
            placeholder="e.g. /products"
            value={annFormValues.link}
            onChange={(e) => setAnnFormValues(prev => ({ ...prev, link: e.target.value }))}
          />

          <Select
            name="status"
            label="Status"
            value={annFormValues.status}
            onChange={(e) => setAnnFormValues(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>

          <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setAnnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* PROMO ADD / EDIT MODAL */}
      <Modal
        open={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
        title={isEditing ? 'Edit Promo Campaign Card' : 'Create Promo Campaign Card'}
      >
        <form onSubmit={handlePromoSave} className="space-y-4">
          <Input
            name="title"
            label="Promo Header Title"
            placeholder="e.g. Summer Snack Collection"
            value={promoFormValues.title}
            onChange={(e) => setPromoFormValues(prev => ({ ...prev, title: e.target.value }))}
            error={formErrors.title}
            required
          />

          <Input
            name="subtitle"
            label="Promo Subheading details"
            placeholder="Beat the heat with Zig Zac Spicy & Salted Pipe crunch."
            value={promoFormValues.subtitle}
            onChange={(e) => setPromoFormValues(prev => ({ ...prev, subtitle: e.target.value }))}
            error={formErrors.subtitle}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="badge"
              label="Tag Badge Accent"
              placeholder="e.g. Limited Time, Partner With Us"
              value={promoFormValues.badge}
              onChange={(e) => setPromoFormValues(prev => ({ ...prev, badge: e.target.value }))}
            />
            <Input
              name="cta"
              label="CTA Button Text"
              placeholder="e.g. Shop Now"
              value={promoFormValues.cta}
              onChange={(e) => setPromoFormValues(prev => ({ ...prev, cta: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
            <Input
              name="link"
              label="Redirect Action Link"
              value={promoFormValues.link}
              onChange={(e) => setPromoFormValues(prev => ({ ...prev, link: e.target.value }))}
            />
            <Select
              name="status"
              label="Publish Status"
              value={promoFormValues.status}
              onChange={(e) => setPromoFormValues(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>

          <Input
            name="gradient"
            label="UI Skin Gradient (Tailwind classes)"
            placeholder="from-brand-primary via-brand-primary-dark to-surface-dark"
            value={promoFormValues.gradient}
            onChange={(e) => setPromoFormValues(prev => ({ ...prev, gradient: e.target.value }))}
            error={formErrors.gradient}
            required
          />

          <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setPromoModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Promo Card
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
