import React from 'react'
import { cn } from '../../utils/cn'

const VARIANTS = {
  primary: 'bg-primary text-white shadow-primary hover:bg-primary/95 hover:-translate-y-0.5 shadow-md active:scale-98',
  secondary: 'border border-border bg-card text-foreground hover:bg-muted/50 hover:-translate-y-0.5 active:scale-98',
  danger: 'bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 active:scale-98',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95',
  outline: 'border border-primary text-primary hover:bg-primary-light transition-all active:scale-98'
}

export default function Button({
  children,
  variant = 'primary',
  className,
  disabled,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
