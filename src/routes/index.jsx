import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))

export const Route = createFileRoute('/')({
  component: DashboardPage,
})
