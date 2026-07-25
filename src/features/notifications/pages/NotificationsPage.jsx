import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from '../../../store/api/notifications.api'
import Button from '../../../components/ui/Button'
import PageSkeleton from '../../../components/shared/PageSkeleton'
import { cn } from '../../../utils/cn'

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [page, setPage] = useState(1)

  const { data: envelope, isLoading, isError, error, isFetching } = useGetNotificationsQuery({
    page,
    limit: 20,
    unreadOnly: unreadOnly ? 'true' : undefined,
  })
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()

  const items = envelope?.data || []
  const meta = envelope?.meta || {}
  const unreadCount = meta.unreadCount ?? 0
  const totalPages = meta.totalPages || 1

  if (isLoading) return <PageSkeleton />
  if (isError) {
    return (
      <div className="text-sm font-bold text-rose-600">
        {error?.data?.message || 'Failed to load notifications'}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display flex items-center gap-2">
            <Bell className="text-primary" size={28} />
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount} unread · staff activity feed
            {isFetching ? ' · refreshing…' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!unreadOnly ? 'primary' : 'secondary'}
            onClick={() => {
              setUnreadOnly(false)
              setPage(1)
            }}
          >
            All
          </Button>
          <Button
            variant={unreadOnly ? 'primary' : 'secondary'}
            onClick={() => {
              setUnreadOnly(true)
              setPage(1)
            }}
          >
            Unread
          </Button>
          <Button
            variant="outline"
            disabled={unreadCount === 0 || markingAll}
            onClick={() => markAllRead()}
            className="flex items-center gap-1.5"
          >
            <CheckCheck size={16} />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No notifications found.</div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={cn(
                'p-4 flex flex-col sm:flex-row sm:items-start gap-3 hover:bg-muted/20 transition-colors',
                !n.isRead && 'bg-primary/5',
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide">
                  <span className="text-primary">{n.type}</span>
                  {!n.isRead && (
                    <span className="px-1.5 py-0.5 rounded bg-red-500 text-white normal-case">New</span>
                  )}
                  <span className="text-muted-foreground font-semibold normal-case tracking-normal">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mt-1">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={() => {
                      if (!n.isRead) markRead(n.id)
                    }}
                    className="inline-block mt-2 text-xs font-bold text-primary hover:underline"
                  >
                    Open related page →
                  </Link>
                )}
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                {!n.isRead && (
                  <Button variant="secondary" onClick={() => markRead(n.id)} className="text-xs py-1.5 px-3">
                    Mark read
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this notification?')) deleteNotification(n.id)
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs font-bold text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
