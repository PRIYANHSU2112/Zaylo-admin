import React, { useId } from 'react'
import { cn } from '../../utils/cn'

export const Input = React.forwardRef(({ label, error, className, id: externalId, ...props }, ref) => {
  const autoId = useId()
  const id = externalId || autoId

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-foreground/80">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-sm disabled:opacity-50 disabled:bg-muted',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export const Textarea = React.forwardRef(({ label, error, className, id: externalId, rows = 4, ...props }, ref) => {
  const autoId = useId()
  const id = externalId || autoId

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-foreground/80">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={cn(
          'w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-sm resize-none disabled:opacity-50 disabled:bg-muted',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'
