import React from 'react'

function Block({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-muted/80 ${className}`} />
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="space-y-2">
          <Block className="h-8 w-56" />
          <Block className="h-4 w-72" />
        </div>
        <Block className="h-12 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Block className="h-80 lg:col-span-2" />
        <Block className="h-80" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Block className="h-72 lg:col-span-2" />
        <Block className="h-72" />
      </div>
    </div>
  )
}
