import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const CategoriesPage = lazy(() => import('../features/catalog/pages/CategoriesPage'))

export const Route = createFileRoute('/categories')({
  component: CategoriesPage,
})
