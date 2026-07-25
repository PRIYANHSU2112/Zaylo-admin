import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ProductsPage = lazy(() => import('../features/catalog/pages/ProductsPage'))

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})
