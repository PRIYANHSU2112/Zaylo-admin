import React, { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '../../../store/api/ops.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

const PAGE_SIZE = 20
const EMPTY = {
  code: '',
  description: '',
  type: 'percent',
  value: '',
  minOrder: 0,
  maxDiscount: 0,
  usageLimit: 0,
  perUserLimit: 1,
  validFrom: '',
  validTo: '',
  status: 'Active',
}
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')
const errMsg = (e) => {
  const details = e?.data?.error?.details
  return Array.isArray(details) && details.length ? details.join(', ') : e?.data?.message || 'Request failed'
}

export default function CouponsPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const { data: res, isLoading, isFetching, isError, error } = useGetCouponsQuery({ page, limit: PAGE_SIZE, q })
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation()
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation()
  const [deleteCoupon] = useDeleteCouponMutation()
  const [editing, setEditing] = useState(null) // null | 'new' | coupon
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState('')

  const open = (coupon) => {
    setEditing(coupon || 'new')
    setFormError('')
    setForm(
      coupon
        ? { ...EMPTY, ...coupon, validFrom: toDateInput(coupon.validFrom), validTo: toDateInput(coupon.validTo) }
        : EMPTY,
    )
  }

  const save = async (e) => {
    e.preventDefault()
    setFormError('')
    const body = {
      code: form.code.trim().toUpperCase(),
      description: form.description,
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      usageLimit: Number(form.usageLimit) || 0,
      perUserLimit: Number(form.perUserLimit) || 0,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validTo: form.validTo ? new Date(`${form.validTo}T23:59:59`).toISOString() : null,
      status: form.status,
    }
    try {
      if (editing === 'new') await createCoupon(body).unwrap()
      else await updateCoupon({ id: editing.id, ...body }).unwrap()
      setEditing(null)
    } catch (err) {
      setFormError(errMsg(err))
    }
  }

  const headers = [
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono font-bold text-primary">{v}</span> },
    {
      key: 'value',
      label: 'Discount',
      render: (v, row) => (row.type === 'percent' ? `${v}%${row.maxDiscount ? ` (max ₹${row.maxDiscount})` : ''}` : `₹${v} off`),
    },
    { key: 'minOrder', label: 'Min order', render: (v) => (v ? `₹${v}` : '—') },
    { key: 'usedCount', label: 'Used', render: (v, row) => `${v || 0}${row.usageLimit ? ` / ${row.usageLimit}` : ''}` },
    {
      key: 'validTo',
      label: 'Validity',
      render: (_v, row) =>
        row.validFrom || row.validTo
          ? `${row.validFrom ? new Date(row.validFrom).toLocaleDateString() : '…'} → ${row.validTo ? new Date(row.validTo).toLocaleDateString() : '…'}`
          : 'No expiry',
    },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v}>{v}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => open(row)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg cursor-pointer" aria-label="Edit coupon">
            <Pencil size={16} />
          </button>
          <button
            onClick={() => confirm(`Delete coupon ${row.code}?`) && deleteCoupon(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg cursor-pointer"
            aria-label="Delete coupon"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (isLoading) return <PageSkeleton />
  if (isError) return <div className="text-sm font-bold text-rose-600">{errMsg(error)}</div>

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Discount codes validated and applied server-side at checkout.</p>
        </div>
        <Button onClick={() => open(null)}><Plus size={16} /> New coupon</Button>
      </div>

      <AdminTable
        headers={headers}
        data={res?.data || []}
        loading={isFetching}
        searchPlaceholder="Search coupon code..."
        server={{ page, limit: PAGE_SIZE, total: res?.meta?.total || 0, onPageChange: setPage, onSearch: (v) => { setQ(v); setPage(1) } }}
      />

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'New coupon' : `Edit ${editing?.code || ''}`}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Code" required value={form.code} onChange={set('code')} pattern="[A-Za-z0-9_\-]{3,30}" />
            <Select label="Type" value={form.type} onChange={set('type')}>
              <option value="percent">Percent off</option>
              <option value="flat">Flat ₹ off</option>
            </Select>
            <Input label={form.type === 'percent' ? 'Percent (1–100)' : 'Amount (₹)'} type="number" min="1" max={form.type === 'percent' ? 100 : undefined} required value={form.value} onChange={set('value')} />
            <Input label="Max discount ₹ (0 = no cap)" type="number" min="0" value={form.maxDiscount} onChange={set('maxDiscount')} disabled={form.type !== 'percent'} />
            <Input label="Minimum order ₹" type="number" min="0" value={form.minOrder} onChange={set('minOrder')} />
            <Input label="Total uses (0 = unlimited)" type="number" min="0" value={form.usageLimit} onChange={set('usageLimit')} />
            <Input label="Uses per customer (0 = unlimited)" type="number" min="0" value={form.perUserLimit} onChange={set('perUserLimit')} />
            <Select label="Status" value={form.status} onChange={set('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
            <Input label="Valid from" type="date" value={form.validFrom} onChange={set('validFrom')} />
            <Input label="Valid until" type="date" value={form.validTo} onChange={set('validTo')} />
          </div>
          <Input label="Description (optional)" value={form.description} onChange={set('description')} maxLength={200} />
          {formError && <p className="text-sm font-semibold text-rose-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" disabled={creating || updating}>{creating || updating ? 'Saving…' : 'Save coupon'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
