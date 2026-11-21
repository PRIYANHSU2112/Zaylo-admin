import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const BundlesPage = lazy(() => import('../features/bundles/pages/BundlesPage'))

export const Route = createFileRoute('/bundles')({
  component: BundlesPage,
})
