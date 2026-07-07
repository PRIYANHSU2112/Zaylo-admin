import { createFileRoute } from '@tanstack/react-router'
import DealersPage from '../features/dealers/pages/DealersPage'

export const Route = createFileRoute('/dealers')({
  component: DealersPage,
})
