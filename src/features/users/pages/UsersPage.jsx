import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Edit, Trash } from 'lucide-react'
import {
  addUser,
  editUser,
  deleteUser,
  toggleUserStatus,
  bulkDeleteUsers,
  bulkToggleUserStatus
} from '../../../store/slices/usersSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function UsersPage() {
  const dispatch = useDispatch()
  const users = useSelector(state => state.users.items)
  const currentUser = useSelector(state => state.users.currentUser)

  // Local States
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Filter States
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Form State
  const initialFormState = {
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'Customer',
    status: 'Active'
  }
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  // Apply filters
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    return matchesRole && matchesStatus
  })

  // Handlers
  const handleOpenAdd = () => {
    setFormValues(initialFormState)
    setFormErrors({})
    setIsEditing(false)
    setModalOpen(true)
  }

  const handleOpenEdit = (user) => {
    setFormValues(user)
    setFormErrors({})
    setIsEditing(true)
    setModalOpen(true)
  }

  const handleToggleStatus = (id) => {
    // Prevent toggling current logged in user
    const userToToggle = users.find(u => u.id === id)
    if (userToToggle && userToToggle.email === currentUser.email) {
      alert('You cannot suspend your own active administrator account!')
      return
    }
    dispatch(toggleUserStatus(id))
  }

  const handleDelete = (id) => {
    const userToDelete = users.find(u => u.id === id)
    if (userToDelete && userToDelete.email === currentUser.email) {
      alert('You cannot delete your own active administrator account!')
      return
    }
    if (confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id))
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
    if (!formValues.name.trim()) errors.name = 'Full name is required'
    if (!formValues.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'Email address is invalid'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveUser = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (isEditing) {
      dispatch(editUser(formValues))
    } else {
      dispatch(addUser(formValues))
    }
    setModalOpen(false)
  }

  // Table Headers
  const headers = [
    {
      key: 'name',
      label: 'Account Holder',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone Contact',
      render: (val) => val || <span className="text-muted-foreground">-</span>
    },
    {
      key: 'role',
      label: 'Authorization Role',
      sortable: true,
      render: (val) => {
        let badgeColor = 'default'
        if (val === 'Admin') badgeColor = 'danger'
        else if (val === 'Manager') badgeColor = 'warning'
        else if (val === 'Distributor') badgeColor = 'success'
        else if (val === 'Customer') badgeColor = 'info'
        
        return <Badge variant={badgeColor}>{val}</Badge>
      }
    },
    {
      key: 'dateJoined',
      label: 'Registration Date',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString([], { dateStyle: 'medium' })
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
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Edit User"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete User"
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
      label: 'Mark Active',
      action: (ids) => dispatch(bulkToggleUserStatus({ ids, status: 'Active' })),
      variant: 'outline'
    },
    {
      label: 'Mark Suspended',
      action: (ids) => dispatch(bulkToggleUserStatus({ ids, status: 'Suspended' })),
      variant: 'outline'
    },
    {
      label: 'Delete Accounts',
      action: (ids) => {
        // Exclude current logged in user from bulk delete selection
        const safeIds = ids.filter(id => {
          const u = users.find(userObj => userObj.id === id)
          return u && u.email !== currentUser.email
        })
        
        if (safeIds.length === 0) {
          alert('No safe accounts selected. You cannot delete your own active account.')
          return
        }

        if (confirm(`Are you sure you want to delete these ${safeIds.length} users?`)) {
          dispatch(bulkDeleteUsers(safeIds))
        }
      },
      variant: 'danger'
    }
  ]

  // Filters Markup
  const FiltersMarkup = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="py-2.5 px-3 min-w-[140px] text-xs h-10"
      >
        <option value="all">All Roles</option>
        <option value="Admin">Admin</option>
        <option value="Manager">Manager</option>
        <option value="Distributor">Distributor</option>
        <option value="Customer">Customer</option>
      </Select>
      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="py-2.5 px-3 min-w-[140px] text-xs h-10"
      >
        <option value="all">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Suspended">Suspended</option>
      </Select>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Provision staff roles (Admin, Manager), evaluate distributor logins, and search customers.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus size={18} /> Add Staff User
        </Button>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={filteredUsers}
        searchPlaceholder="Search users by name, email, roles, status..."
        filters={FiltersMarkup}
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={10}
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit User Credentials' : 'Provision Staff User'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Input
            name="name"
            label="Full Name"
            placeholder="e.g. Karan Malhotra"
            value={formValues.name}
            onChange={handleFormChange}
            error={formErrors.name}
            required
          />

          <Input
            name="email"
            label="Email Address"
            type="email"
            placeholder="e.g. karan.m@zaylosnacks.com"
            value={formValues.email}
            onChange={handleFormChange}
            error={formErrors.email}
            required
            disabled={isEditing} // Cannot change email for active logins
          />

          <Input
            name="phone"
            label="Phone Number"
            placeholder="e.g. +91 95555 44444"
            value={formValues.phone}
            onChange={handleFormChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-3">
            <Select
              name="role"
              label="Fulfillment Role"
              value={formValues.role}
              onChange={handleFormChange}
            >
              <option value="Customer">Customer</option>
              <option value="Distributor">Distributor</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </Select>

            <Select
              name="status"
              label="Account Status"
              value={formValues.status}
              onChange={handleFormChange}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </Select>
          </div>

          <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save User Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
