import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const NotificationsPage = lazy(() => import('../features/notifications/pages/NotificationsPage'))

export const Route = createFileRoute('/notifications')({
  component: NotificationsPage,
})
