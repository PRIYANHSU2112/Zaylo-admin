import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../../utils/cn'

function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  trendLabel = '',
  onClick,
  accent = 'primary',
  index = 0,
}) {
  const isUp = trendDirection === 'up'
  const accents = {
    primary: 'from-primary/20 via-primary/5 to-transparent',
    rose: 'from-rose-500/20 via-rose-500/5 to-transparent',
    amber: 'from-amber-500/20 via-amber-500/5 to-transparent',
    sky: 'from-sky-500/20 via-sky-500/5 to-transparent',
    violet: 'from-violet-500/20 via-violet-500/5 to-transparent',
    emerald: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'relative w-full text-left overflow-hidden rounded-2xl border border-border/80',
        'bg-card/70 dark:bg-card/50 backdrop-blur-xl shadow-[var(--shadow-card)]',
        'p-5 transition-colors cursor-pointer group',
        onClick && 'hover:border-primary/30',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80',
          accents[accent] || accents.primary,
        )}
      />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold font-display text-foreground truncate">
            {value}
          </p>
          {(trend || trendLabel) && (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {trend != null && trend !== '' && (
                <>
                  {isUp ? (
                    <TrendingUp size={14} className="text-primary shrink-0" />
                  ) : (
                    <TrendingDown size={14} className="text-rose-500 shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-bold',
                      isUp ? 'text-primary' : 'text-rose-500',
                    )}
                  >
                    {trend}
                  </span>
                </>
              )}
              {trendLabel && (
                <span className="text-[11px] text-muted-foreground">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-background/60 border border-border/60 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
            <Icon size={18} />
          </div>
        )}
      </div>
    </motion.button>
  )
}

export default memo(KpiCard)
