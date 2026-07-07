import React from 'react'
import { cn } from '../../utils/cn'

const VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  info: 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  default: 'bg-slate-50 text-slate-700 border-slate-200/50 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
}

export default function Badge({ children, variant = 'default', className }) {
  // Map common status values to badge variants automatically if needed
  let calculatedVariant = variant
  const val = String(children).toLowerCase().trim()

  if (['active', 'approved', 'delivered', 'published', 'yes', 'true'].includes(val)) {
    calculatedVariant = 'success'
  } else if (['pending', 'under review', 'new', 'coming soon', 'contacted'].includes(val)) {
    calculatedVariant = 'warning'
  } else if (['inactive', 'cancelled', 'rejected', 'suspended', 'out of stock', 'no', 'false'].includes(val)) {
    calculatedVariant = 'danger'
  } else if (['shipped', 'read', 'replied'].includes(val)) {
    calculatedVariant = 'info'
  } else if (['draft'].includes(val)) {
    calculatedVariant = 'default'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors',
        VARIANTS[calculatedVariant] || VARIANTS.default,
        className
      )}
    >
      {children}
    </span>
  )
}
