import { createFileRoute } from '@tanstack/react-router'
import BulkOrdersPage from '../features/bulk-orders/pages/BulkOrdersPage'

export const Route = createFileRoute('/bulk-orders')({
  component: BulkOrdersPage,
})
