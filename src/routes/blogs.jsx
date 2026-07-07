import { createFileRoute } from '@tanstack/react-router'
import BlogsPage from '../features/blogs/pages/BlogsPage'

export const Route = createFileRoute('/blogs')({
  component: BlogsPage,
})
