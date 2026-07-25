import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const GalleryPage = lazy(() => import('../features/gallery/pages/GalleryPage'))

export const Route = createFileRoute('/gallery')({
  component: GalleryPage,
})
