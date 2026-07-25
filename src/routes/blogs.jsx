import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const BlogsPage = lazy(() => import('../features/blogs/pages/BlogsPage'))

export const Route = createFileRoute('/blogs')({
  component: BlogsPage,
})
