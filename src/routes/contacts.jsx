import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ContactsPage = lazy(() => import('../features/contacts/pages/ContactsPage'))

export const Route = createFileRoute('/contacts')({
  component: ContactsPage,
})
