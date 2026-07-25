import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const BulkOrdersPage = lazy(() => import('../features/bulk-orders/pages/BulkOrdersPage'))

export const Route = createFileRoute('/bulk-orders')({
  component: BulkOrdersPage,
})
