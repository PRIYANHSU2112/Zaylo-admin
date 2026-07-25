import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const DealersPage = lazy(() => import('../features/dealers/pages/DealersPage'))

export const Route = createFileRoute('/dealers')({
  component: DealersPage,
})
