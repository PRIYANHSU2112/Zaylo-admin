import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const UsersPage = lazy(() => import('../features/users/pages/UsersPage'))

export const Route = createFileRoute('/users')({
  component: UsersPage,
})
