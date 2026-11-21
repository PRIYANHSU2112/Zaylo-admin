import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const CouponsPage = lazy(() => import('../features/coupons/pages/CouponsPage'))

export const Route = createFileRoute('/coupons')({
  component: CouponsPage,
})
