import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const OrdersPage = lazy(() => import('../features/orders/pages/OrdersPage'))

export const Route = createFileRoute('/orders')({
  component: OrdersPage,
})
