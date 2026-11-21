import React, { useMemo, useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'
import {
  useGetBundlesQuery,
  useCreateBundleMutation,
  useUpdateBundleMutation,
  useDeleteBundleMutation,
} from '../../../store/api/content.api'
import { useGetProductsQuery } from '../../../store/api/catalog.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

const emptyForm = {
  id: '',
  name: '',
  tagline: '',
  price: 0,
  mrp: 0,
  productIds: [],
  position: 0,
  status: 'Active',
}

export default function BundlesPage() {
  const { data: env, isLoading, isError, error } = useGetBundlesQuery({ limit: 100 })
  const { data: productsEnv } = useGetProductsQuery({ limit: 100 })
  const [createBundle, { isLoading: creating }] = useCreateBundleMutation()
  const [updateBundle, { isLoading: updating }] = useUpdateBundleMutation()
  const [deleteBundle] = useDeleteBundleMutation()

  const bundles = env?.data || []
  const products = productsEnv?.data || []
  const productNameById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.name])),
    [products],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const open = (row) => {
    if (row) {
      setForm({
        ...emptyForm,
        ...row,
        productIds: (row.productIds || []).map((id) => String(id)),
        position: row.position ?? 0,
      })
      setIsEditing(true)
    } else {
      setForm(emptyForm)
      setIsEditing(false)
    }
    setFormError('')
    setModalOpen(true)
  }

  const toggleProduct = (id) => {
    setForm((prev) => {
      const set = new Set(prev.productIds)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...prev, productIds: [...set] }
    })
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setFormError('Name is required')
      return
    }
    if (!form.productIds.length) {
      setFormError('Select at least one product for the pack')
      return
    }
    if (Number(form.price) <= 0 || Number(form.price) > Number(form.mrp)) {
      setFormError('Pack price must be above 0 and not higher than MRP')
      return
    }
    const body = {
      name: form.name,
      tagline: form.tagline,
      price: Number(form.price) || 0,
      mrp: Number(form.mrp) || 0,
      productIds: form.productIds,
      position: Number(form.position) || 0,
      status: form.status,
    }
    try {
      if (isEditing) await updateBundle({ id: form.id, ...body }).unwrap()
      else await createBundle(body).unwrap()
      setModalOpen(false)
    } catch (err) {
      const details = err?.data?.error?.details
      setFormError(Array.isArray(details) && details.length ? details.join(', ') : err?.data?.message || 'Failed to save')
    }
  }

  const headers = [
    {
      key: 'name',
      label: 'Bundle',
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="font-semibold">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.tagline}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (_v, row) => {
        const off = row.mrp > row.price ? Math.round(((row.mrp - row.price) / row.mrp) * 100) : 0
        return (
          <div>
            <p className="font-bold">₹{row.price} <span className="text-xs font-normal text-muted-foreground line-through">₹{row.mrp}</span></p>
            {off > 0 && <p className="text-xs font-bold text-emerald-600">{off}% off</p>}
          </div>
        )
      },
    },
    {
      key: 'availability',
      label: 'Packs available',
      render: (v, row) =>
        row.purchasable === false ? (
          <span className="text-xs font-bold text-rose-600" title="Bundle inactive or contains an inactive product">Hidden on site</span>
        ) : (
          <span className={`text-sm font-bold ${v > 5 ? 'text-emerald-600' : v > 0 ? 'text-amber-600' : 'text-rose-600'}`}>{v ?? '—'}</span>
        ),
    },
    {
      key: 'productIds',
      label: 'Items',
      render: (ids) => (
        <span className="text-xs text-muted-foreground">
          {(ids || []).map((id) => productNameById[id] || id).join(', ') || '—'}
        </span>
      ),
    },
    { key: 'position', label: 'Pos', sortable: true },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={val}>{val}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-1.5">
          <button type="button" onClick={() => open(row)} className="p-1.5 hover:text-primary cursor-pointer"><Edit size={16} /></button>
          <button type="button" onClick={() => confirm('Delete bundle?') && deleteBundle(row.id)} className="p-1.5 hover:text-red-500 cursor-pointer"><Trash size={16} /></button>
        </div>
      ),
    },
  ]

  if (isLoading) return <PageSkeleton />
  if (isError) return <div className="text-sm font-bold text-rose-600">{error?.data?.message || 'Failed to load'}</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display">Bundle Packs</h1>
          <p className="text-sm text-muted-foreground mt-1">Sold as one item at the pack price. Stock is reserved from every product inside; availability updates automatically.</p>
        </div>
        <Button onClick={() => open(null)} className="flex items-center gap-2">
          <Plus size={18} /> Add Bundle
        </Button>
      </div>

      {bundles.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          No packs yet. Create one to show the <strong>Popular Bundle Pack</strong> section on the home page.
        </p>
      )}
      <AdminTable headers={headers} data={bundles} searchPlaceholder="Search bundles..." idField="id" itemsPerPage={10} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Bundle' : 'New Bundle'}>
        <form onSubmit={save} className="space-y-4">
          {formError && <p className="text-xs font-bold text-rose-600">{formError}</p>}
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Tagline" value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Price" type="number" min={0} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            <Input label="MRP" type="number" min={0} value={form.mrp} onChange={(e) => setForm((p) => ({ ...p, mrp: e.target.value }))} />
            <Input label="Position" type="number" min={0} value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} />
          </div>
          <Select label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
          <div>
            <p className="text-sm font-semibold mb-2">Products in bundle</p>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-xl p-3">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.productIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={creating || updating}>{creating || updating ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
