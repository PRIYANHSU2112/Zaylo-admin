import React, { useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetPromosQuery,
  useCreatePromoMutation,
  useUpdatePromoMutation,
  useDeletePromoMutation,
} from '../../../store/api/content.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function BannersPage() {
  const { data: annEnv, isLoading: aLoading, isError: aErr, error: aError } = useGetAnnouncementsQuery()
  const { data: promoEnv, isLoading: pLoading, isError: pErr, error: pError } = useGetPromosQuery()
  const [createAnn, { isLoading: cA }] = useCreateAnnouncementMutation()
  const [updateAnn, { isLoading: uA }] = useUpdateAnnouncementMutation()
  const [deleteAnn] = useDeleteAnnouncementMutation()
  const [createPromo, { isLoading: cP }] = useCreatePromoMutation()
  const [updatePromo, { isLoading: uP }] = useUpdatePromoMutation()
  const [deletePromo] = useDeletePromoMutation()

  const announcements = annEnv?.data || []
  const promos = promoEnv?.data || []

  const [tab, setTab] = useState('announcements')
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formError, setFormError] = useState('')
  const [annForm, setAnnForm] = useState({ id: '', text: '', link: '', status: 'Active' })
  const [promoForm, setPromoForm] = useState({
    id: '',
    title: '',
    subtitle: '',
    cta: '',
    link: '',
    gradient: 'from-brand-primary to-brand-orange',
    badge: '',
    status: 'Active',
  })

  const openAnn = (row) => {
    setTab('announcements')
    setAnnForm(row || { id: '', text: '', link: '', status: 'Active' })
    setIsEditing(Boolean(row))
    setFormError('')
    setModalOpen(true)
  }

  const openPromo = (row) => {
    setTab('promos')
    setPromoForm(
      row || {
        id: '',
        title: '',
        subtitle: '',
        cta: '',
        link: '',
        gradient: 'from-brand-primary to-brand-orange',
        badge: '',
        status: 'Active',
      },
    )
    setIsEditing(Boolean(row))
    setFormError('')
    setModalOpen(true)
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      if (tab === 'announcements') {
        if (!annForm.text.trim()) {
          setFormError('Text is required')
          return
        }
        const body = { text: annForm.text, link: annForm.link, status: annForm.status }
        if (isEditing) await updateAnn({ id: annForm.id, ...body }).unwrap()
        else await createAnn(body).unwrap()
      } else {
        if (!promoForm.title.trim()) {
          setFormError('Title is required')
          return
        }
        const body = {
          title: promoForm.title,
          subtitle: promoForm.subtitle,
          cta: promoForm.cta,
          link: promoForm.link,
          gradient: promoForm.gradient,
          badge: promoForm.badge,
          status: promoForm.status,
        }
        if (isEditing) await updatePromo({ id: promoForm.id, ...body }).unwrap()
        else await createPromo(body).unwrap()
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err?.data?.message || 'Failed to save')
    }
  }

  const annHeaders = [
    { key: 'text', label: 'Announcement', sortable: true },
    { key: 'link', label: 'Link' },
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
          <button onClick={() => openAnn(row)} className="p-1.5 hover:text-primary cursor-pointer"><Edit size={16} /></button>
          <button onClick={() => confirm('Delete?') && deleteAnn(row.id)} className="p-1.5 hover:text-red-500 cursor-pointer"><Trash size={16} /></button>
        </div>
      ),
    },
  ]

  const promoHeaders = [
    {
      key: 'title',
      label: 'Promo',
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="font-semibold">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.subtitle}</p>
        </div>
      ),
    },
    { key: 'cta', label: 'CTA' },
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
          <button onClick={() => openPromo(row)} className="p-1.5 hover:text-primary cursor-pointer"><Edit size={16} /></button>
          <button onClick={() => confirm('Delete?') && deletePromo(row.id)} className="p-1.5 hover:text-red-500 cursor-pointer"><Trash size={16} /></button>
        </div>
      ),
    },
  ]

  if (aLoading || pLoading) return <PageSkeleton />
  if (aErr || pErr) {
    return (
      <div className="text-sm font-bold text-rose-600">
        {aError?.data?.message || pError?.data?.message || 'Failed to load'}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display">Promo Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">Announcements strip and promo cards.</p>
        </div>
        <Button
          onClick={() => (tab === 'announcements' ? openAnn(null) : openPromo(null))}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Add {tab === 'announcements' ? 'Announcement' : 'Promo'}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'announcements' ? 'primary' : 'secondary'} onClick={() => setTab('announcements')}>
          Announcements
        </Button>
        <Button variant={tab === 'promos' ? 'primary' : 'secondary'} onClick={() => setTab('promos')}>
          Promos
        </Button>
      </div>

      {tab === 'announcements' ? (
        <AdminTable headers={annHeaders} data={announcements} searchPlaceholder="Search announcements..." idField="id" itemsPerPage={8} />
      ) : (
        <AdminTable headers={promoHeaders} data={promos} searchPlaceholder="Search promos..." idField="id" itemsPerPage={8} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={tab === 'announcements' ? (isEditing ? 'Edit Announcement' : 'New Announcement') : isEditing ? 'Edit Promo' : 'New Promo'}
      >
        <form onSubmit={save} className="space-y-4">
          {formError && <p className="text-xs font-bold text-rose-600">{formError}</p>}
          {tab === 'announcements' ? (
            <>
              <Input name="text" label="Text" value={annForm.text} onChange={(e) => setAnnForm((p) => ({ ...p, text: e.target.value }))} required />
              <Input name="link" label="Link" value={annForm.link} onChange={(e) => setAnnForm((p) => ({ ...p, link: e.target.value }))} />
              <Select name="status" label="Status" value={annForm.status} onChange={(e) => setAnnForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </>
          ) : (
            <>
              <Input name="title" label="Title" value={promoForm.title} onChange={(e) => setPromoForm((p) => ({ ...p, title: e.target.value }))} required />
              <Input name="subtitle" label="Subtitle" value={promoForm.subtitle} onChange={(e) => setPromoForm((p) => ({ ...p, subtitle: e.target.value }))} />
              <Input name="cta" label="CTA" value={promoForm.cta} onChange={(e) => setPromoForm((p) => ({ ...p, cta: e.target.value }))} />
              <Input name="link" label="Link" value={promoForm.link} onChange={(e) => setPromoForm((p) => ({ ...p, link: e.target.value }))} />
              <Input name="badge" label="Badge" value={promoForm.badge} onChange={(e) => setPromoForm((p) => ({ ...p, badge: e.target.value }))} />
              <Input name="gradient" label="Gradient" value={promoForm.gradient} onChange={(e) => setPromoForm((p) => ({ ...p, gradient: e.target.value }))} />
              <Select name="status" label="Status" value={promoForm.status} onChange={(e) => setPromoForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </>
          )}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={cA || uA || cP || uP}>{cA || uA || cP || uP ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
