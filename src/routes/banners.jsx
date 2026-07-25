import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const BannersPage = lazy(() => import('../features/banners/pages/BannersPage'))

export const Route = createFileRoute('/banners')({
  component: BannersPage,
})
