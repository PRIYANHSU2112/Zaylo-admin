import { createFileRoute } from '@tanstack/react-router'
import BannersPage from '../features/banners/pages/BannersPage'

export const Route = createFileRoute('/banners')({
  component: BannersPage,
})
