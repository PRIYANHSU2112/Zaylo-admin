import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from '@tanstack/react-router'
import { Plus, Edit, Trash } from 'lucide-react'
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkUsersMutation,
} from '../../../store/api/content.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function UsersPage() {
  const role = useSelector((s) => s.auth.user?.role)
  const isAdmin = role === 'Admin'

  const { data: env, isLoading, isError, error } = useGetUsersQuery(
    { limit: 100 },
    { skip: !isAdmin },
  )
  const [createUser, { isLoading: creating }] = useCreateUserMutation()
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [bulkUsers] = useBulkUsersMutation()
  const users = env?.data || []

  const empty = { id: '', name: '', email: '', phone: '', role: 'Customer', status: 'Active', password: '' }
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(empty)
  const [formError, setFormError] = useState('')

  // Hooks above must run unconditionally (rules of hooks); redirect non-admins after them.
  if (role && !isAdmin) return <Navigate to="/" />

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required')
      return
    }
    try {
      if (isEditing) {
        const body = { name: form.name, phone: form.phone, role: form.role, status: form.status }
        if (form.password) body.password = form.password
        await updateUser({ id: form.id, ...body }).unwrap()
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          status: form.status,
          password: form.password || undefined,
        }).unwrap()
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err?.data?.message || 'Failed to save')
    }
  }

  const headers = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="font-semibold">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'phone', label: 'Phone' },
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
          <button
            onClick={() => {
              setForm({ ...row, password: '' })
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
              if (confirm('Delete user?')) deleteUser(row.id)
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
          <h1 className="text-3xl font-extrabold font-display">User Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage staff and customer accounts.</p>
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
          <Plus size={18} /> Add User
        </Button>
      </div>

      <AdminTable
        headers={headers}
        data={users}
        searchPlaceholder="Search users..."
        idField="id"
        itemsPerPage={10}
        bulkActions={[
          {
            label: 'Suspend',
            action: (ids) => bulkUsers({ action: 'status', ids, status: 'Suspended' }),
            variant: 'outline',
          },
          {
            label: 'Delete',
            action: (ids) => {
              if (confirm(`Delete ${ids.length} users?`)) bulkUsers({ action: 'delete', ids })
            },
            variant: 'danger',
          },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit User' : 'Add User'}>
        <form onSubmit={save} className="space-y-4">
          {formError && <p className="text-xs font-bold text-rose-600">{formError}</p>}
          <Input name="name" label="Name" value={form.name} onChange={onChange} required />
          {!isEditing && <Input name="email" label="Email" type="email" value={form.email} onChange={onChange} required />}
          <Input name="phone" label="Phone" value={form.phone || ''} onChange={onChange} />
          <Select name="role" label="Role" value={form.role} onChange={onChange}>
            <option value="Customer">Customer</option>
            <option value="Distributor">Distributor</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </Select>
          <Select name="status" label="Status" value={form.status} onChange={onChange}>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </Select>
          <Input
            name="password"
            label={isEditing ? 'New Password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={onChange}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={creating || updating}>{creating || updating ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
