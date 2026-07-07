import { createFileRoute } from '@tanstack/react-router'
import ProductsPage from '../features/catalog/pages/ProductsPage'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})
