import React, { useMemo, useState } from 'react'
import { Plus, Edit, Trash, Eye, Monitor, Smartphone } from 'lucide-react'
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
import { useDeleteUploadMutation } from '../../../store/api/catalog.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import ImageUploadField from '../../../components/ui/ImageUploadField'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

/** Website placements (must match Backend utils/banners.js). */
const PLACEMENTS = [
  { value: 'hero', label: 'Home — hero slider', hint: 'Full-width slides at the top of the home page. Image only = your creative fills the slide; add a heading to get a designed slide.' },
  { value: 'home-middle', label: 'Home — middle banner', hint: 'Shown after the product sections on the home page.' },
  { value: 'home-bottom', label: 'Home — above Trusted Partners', hint: 'Bottom of the home page.' },
  { value: 'products', label: 'Products / category page', hint: 'Top of the shop page. Link it to /products?category=<slug> to show it only for that category.' },
  { value: 'about', label: 'About page', hint: 'Bottom of the About page.' },
  { value: 'dealer', label: 'Dealer page', hint: 'Top of the Become-a-Distributor page.' },
]
const LEGACY = { general: 'hero', 'home-festival': 'home-middle', 'home-dealer': 'home-bottom' }
const placementOf = (slot) => LEGACY[slot] || slot || 'hero'
const placementLabel = (slot) => PLACEMENTS.find((p) => p.value === placementOf(slot))?.label || slot

const emptyBanner = {
  title: '',
  subtitle: '',
  cta: 'Shop Now',
  link: '/products',
  badge: '',
  slot: 'hero',
  variant: 'default',
  imageUrl: '',
  mobileImageUrl: '',
  bgImageUrl: '',
  startsAt: '',
  endsAt: '',
  position: 0,
  status: 'Active',
}
const emptyAnn = { text: '', link: '/products', position: 0, status: 'Active' }
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '')
const errMsg = (e) => {
  const d = e?.data?.error?.details
  return Array.isArray(d) && d.length ? d.join(', ') : e?.data?.message || 'Failed to save'
}

function scheduleState(b) {
  const now = Date.now()
  if (b.status !== 'Active') return { label: 'Inactive', variant: 'Inactive' }
  if (b.startsAt && new Date(b.startsAt).getTime() > now) return { label: 'Scheduled', variant: 'Pending' }
  if (b.endsAt && new Date(b.endsAt).getTime() < now) return { label: 'Expired', variant: 'Cancelled' }
  return { label: 'Live', variant: 'Active' }
}

export default function BannersPage() {
  const { data: promoEnv, isLoading: pLoading, isError: pErr, error: pError } = useGetPromosQuery()
  const { data: annEnv, isLoading: aLoading } = useGetAnnouncementsQuery()
  const [createPromo, { isLoading: cP }] = useCreatePromoMutation()
  const [updatePromo, { isLoading: uP }] = useUpdatePromoMutation()
  const [deletePromo] = useDeletePromoMutation()
  const [createAnn, { isLoading: cA }] = useCreateAnnouncementMutation()
  const [updateAnn, { isLoading: uA }] = useUpdateAnnouncementMutation()
  const [deleteAnn] = useDeleteAnnouncementMutation()
  const [deleteUpload] = useDeleteUploadMutation()

  const [tab, setTab] = useState('banners')
  const [placementFilter, setPlacementFilter] = useState('all')
  const [editing, setEditing] = useState(null) // null | 'new' | row
  const [form, setForm] = useState(emptyBanner)
  const [annForm, setAnnForm] = useState(emptyAnn)
  const [formError, setFormError] = useState('')
  const [preview, setPreview] = useState(null)

  const banners = useMemo(() => promoEnv?.data || [], [promoEnv])
  const announcements = annEnv?.data || []
  const shown = placementFilter === 'all' ? banners : banners.filter((b) => placementOf(b.slot) === placementFilter)

  const openBanner = (row) => {
    setTab('banners')
    setFormError('')
    setEditing(row || 'new')
    setForm(
      row
        ? { ...emptyBanner, ...row, slot: placementOf(row.slot), startsAt: toDateInput(row.startsAt), endsAt: toDateInput(row.endsAt) }
        : emptyBanner,
    )
  }
  const openAnn = (row) => {
    setTab('announcements')
    setFormError('')
    setEditing(row || 'new')
    setAnnForm(row ? { ...emptyAnn, ...row } : emptyAnn)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      if (tab === 'announcements') {
        const body = { text: annForm.text, link: annForm.link, position: Number(annForm.position) || 0, status: annForm.status }
        if (editing === 'new') await createAnn(body).unwrap()
        else await updateAnn({ id: editing.id, ...body }).unwrap()
      } else {
        if (!form.title.trim() && !form.imageUrl) return setFormError('Add a heading or upload a desktop image')
        const body = {
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          cta: form.cta.trim(),
          link: form.link.trim() || '/products',
          badge: form.badge.trim(),
          slot: form.slot,
          variant: form.variant,
          imageUrl: form.imageUrl,
          mobileImageUrl: form.mobileImageUrl,
          bgImageUrl: form.bgImageUrl,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
          position: Number(form.position) || 0,
          status: form.status,
        }
        if (editing === 'new') await createPromo(body).unwrap()
        else await updatePromo({ id: editing.id, ...body }).unwrap()
      }
      setEditing(null)
    } catch (err) {
      setFormError(errMsg(err))
    }
  }

  const removeBanner = async (row) => {
    if (!confirm(`Delete banner "${row.title || 'image banner'}"? Its images will be removed from storage.`)) return
    await deletePromo(row.id)
    ;[row.imageUrl, row.mobileImageUrl, row.bgImageUrl].filter(Boolean).forEach((u) => deleteUpload(u))
  }

  const bannerHeaders = [
    {
      key: 'title',
      label: 'Banner',
      render: (_v, row) => (
        <div className="flex items-center gap-3">
          {row.imageUrl || row.bgImageUrl ? (
            <img src={row.imageUrl || row.bgImageUrl} alt="" className="h-12 w-20 rounded-lg border border-border object-cover" />
          ) : (
            <span className="flex h-12 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-[#D71920] to-[#FF7A00] text-[9px] font-bold text-white">DESIGNED</span>
          )}
          <div>
            <p className="font-semibold">{row.title || <span className="italic text-muted-foreground">Image only</span>}</p>
            <p className="text-xs text-muted-foreground">{placementLabel(row.slot)} · order {row.position ?? 0}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'startsAt',
      label: 'Schedule',
      render: (_v, row) =>
        row.startsAt || row.endsAt ? (
          <span className="text-xs">
            {row.startsAt ? new Date(row.startsAt).toLocaleDateString() : 'now'} → {row.endsAt ? new Date(row.endsAt).toLocaleDateString() : 'no end'}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Always</span>
        ),
    },
    { key: 'mobileImageUrl', label: 'Mobile art', render: (v) => (v ? '✓' : '—') },
    {
      key: 'status',
      label: 'State',
      render: (_v, row) => {
        const s = scheduleState(row)
        return <Badge variant={s.variant}>{s.label}</Badge>
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-1.5">
          <button type="button" onClick={() => setPreview(row)} className="cursor-pointer p-1.5 hover:text-primary" aria-label="Preview"><Eye size={16} /></button>
          <button type="button" onClick={() => openBanner(row)} className="cursor-pointer p-1.5 hover:text-primary" aria-label="Edit"><Edit size={16} /></button>
          <button type="button" onClick={() => removeBanner(row)} className="cursor-pointer p-1.5 hover:text-red-500" aria-label="Delete"><Trash size={16} /></button>
        </div>
      ),
    },
  ]

  const annHeaders = [
    { key: 'text', label: 'Announcement' },
    { key: 'position', label: 'Order' },
    { key: 'link', label: 'Link' },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={val}>{val}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-1.5">
          <button type="button" onClick={() => openAnn(row)} className="cursor-pointer p-1.5 hover:text-primary"><Edit size={16} /></button>
          <button type="button" onClick={() => confirm('Delete announcement?') && deleteAnn(row.id)} className="cursor-pointer p-1.5 hover:text-red-500"><Trash size={16} /></button>
        </div>
      ),
    },
  ]

  if (pLoading || aLoading) return <PageSkeleton />
  if (pErr) return <div className="text-sm font-bold text-rose-600">{errMsg(pError)}</div>

  const hint = PLACEMENTS.find((p) => p.value === form.slot)?.hint

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Banners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every banner on the website comes from here. Active banners inside their schedule appear automatically.
          </p>
        </div>
        <Button onClick={() => (tab === 'banners' ? openBanner(null) : openAnn(null))} className="flex items-center gap-2">
          <Plus size={18} /> {tab === 'banners' ? 'New banner' : 'New announcement'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={tab === 'banners' ? 'primary' : 'secondary'} onClick={() => setTab('banners')}>Banners ({banners.length})</Button>
        <Button variant={tab === 'announcements' ? 'primary' : 'secondary'} onClick={() => setTab('announcements')}>Announcement bar</Button>
      </div>

      {tab === 'banners' ? (
        <AdminTable
          headers={bannerHeaders}
          data={shown}
          searchPlaceholder="Search banners..."
          idField="id"
          itemsPerPage={10}
          emptyMessage="No banners yet — create one for each placement you want to fill."
          filters={
            <Select value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)} className="h-10 px-3 py-2.5 text-xs">
              <option value="all">All placements</option>
              {PLACEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          }
        />
      ) : (
        <AdminTable headers={annHeaders} data={announcements} searchPlaceholder="Search announcements..." idField="id" itemsPerPage={10} />
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`${editing === 'new' ? 'New' : 'Edit'} ${tab === 'banners' ? 'banner' : 'announcement'}`}>
        <form onSubmit={save} className="space-y-4">
          {tab === 'announcements' ? (
            <>
              <Input label="Text" value={annForm.text} onChange={(e) => setAnnForm((p) => ({ ...p, text: e.target.value }))} required maxLength={140} />
              <Input label="Link" value={annForm.link} onChange={(e) => setAnnForm((p) => ({ ...p, link: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Order" type="number" min={0} value={annForm.position} onChange={(e) => setAnnForm((p) => ({ ...p, position: e.target.value }))} />
                <Select label="Status" value={annForm.status} onChange={(e) => setAnnForm((p) => ({ ...p, status: e.target.value }))}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </>
          ) : (
            <>
              <Select label="Placement" value={form.slot} onChange={set('slot')}>
                {PLACEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
              {hint && <p className="-mt-2 text-xs text-muted-foreground">{hint}</p>}
              <Input label="Heading (leave empty for an image-only banner)" value={form.title} onChange={set('title')} maxLength={120} />
              <Input label="Subtitle" value={form.subtitle} onChange={set('subtitle')} maxLength={240} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Input label="Badge (e.g. 20% OFF)" value={form.badge} onChange={set('badge')} maxLength={40} />
                <Input label="Button text" value={form.cta} onChange={set('cta')} maxLength={40} />
                <Input label="Button / banner link" value={form.link} onChange={set('link')} placeholder="/products?category=namkeen" />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ImageUploadField label="Desktop image (16:6, e.g. 1920×720)" folder="banners" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
                <ImageUploadField label="Mobile image (4:5, e.g. 1080×1350) — optional" folder="banners" value={form.mobileImageUrl} onChange={(url) => setForm((f) => ({ ...f, mobileImageUrl: url }))} />
              </div>
              <ImageUploadField label="Background image (designed banners, optional)" folder="banners" value={form.bgImageUrl} onChange={(url) => setForm((f) => ({ ...f, bgImageUrl: url }))} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input label="Start (optional)" type="datetime-local" value={form.startsAt} onChange={set('startsAt')} />
                <Input label="End (optional)" type="datetime-local" value={form.endsAt} onChange={set('endsAt')} />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Select label="Style" value={form.variant} onChange={set('variant')}>
                  <option value="default">Zaylo red → orange</option>
                  <option value="dark">Dark (#0B0B0F)</option>
                </Select>
                <Input label="Display order" type="number" min={0} value={form.position} onChange={set('position')} />
                <Select label="Status" value={form.status} onChange={set('status')}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
              <Button type="button" variant="secondary" onClick={() => setPreview(form)} className="flex items-center gap-2">
                <Eye size={16} /> Preview
              </Button>
            </>
          )}
          {formError && <p className="text-xs font-bold text-rose-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" disabled={cP || uP || cA || uA}>{cP || uP || cA || uA ? 'Saving…' : 'Save & publish'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title="Banner preview">
        {preview && <BannerPreview banner={preview} />}
      </Modal>
    </div>
  )
}

/** Approximates the website rendering (desktop 16:6, mobile 4:5) using the same rules. */
function BannerPreview({ banner }) {
  const imageOnly = !banner.title && banner.imageUrl
  const frame = (mobile) => {
    const img = mobile ? banner.mobileImageUrl || banner.imageUrl : banner.imageUrl
    if (imageOnly) {
      return <img src={img} alt="" className="h-full w-full object-cover" />
    }
    return (
      <div className={`relative flex h-full w-full ${banner.variant === 'dark' ? 'bg-[#0B0B0F]' : 'bg-gradient-to-br from-[#D71920] to-[#FF7A00]'}`}>
        {banner.bgImageUrl && <img src={banner.bgImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />}
        <div className={`relative z-10 flex flex-col justify-center p-4 text-white ${mobile ? 'w-full' : 'w-1/2'}`}>
          {banner.badge && <span className="mb-1 w-fit rounded-full bg-[#FFD400] px-2 py-0.5 text-[9px] font-extrabold text-[#0B0B0F]">{banner.badge}</span>}
          <p className={`font-bold leading-tight ${mobile ? 'text-base' : 'text-xl'}`}>{banner.title}</p>
          {banner.subtitle && <p className="mt-1 text-[11px] text-white/85">{banner.subtitle}</p>}
          {banner.cta && <span className="mt-2 w-fit rounded-full bg-[#FFD400] px-3 py-1 text-[10px] font-extrabold text-[#0B0B0F]">{banner.cta} →</span>}
        </div>
        {!mobile && img && <img src={img} alt="" className="relative z-10 w-1/2 object-contain p-3" />}
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{placementLabel(banner.slot)}</p>
      <div>
        <p className="mb-1 flex items-center gap-1 text-xs font-bold"><Monitor size={14} /> Desktop</p>
        <div className="aspect-[16/6] overflow-hidden rounded-xl border border-border">{frame(false)}</div>
      </div>
      <div>
        <p className="mb-1 flex items-center gap-1 text-xs font-bold"><Smartphone size={14} /> Mobile</p>
        <div className="mx-auto aspect-[4/5] w-56 overflow-hidden rounded-xl border border-border">{frame(true)}</div>
      </div>
      {!banner.imageUrl && !banner.title && <p className="text-xs font-bold text-rose-600">Add a heading or an image to show this banner.</p>}
    </div>
  )
}
