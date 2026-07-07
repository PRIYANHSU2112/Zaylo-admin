import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  trendLabel = 'vs last month',
  className
}) {
  const isUp = trendDirection === 'up'

  return (
    <div className={cn(
      'bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group hover:border-primary/20 hover:shadow-md transition-all duration-300',
      className
    )}>
      {Icon && (
        <div className="absolute top-4 right-4 p-3 bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary-light rounded-xl transition-all duration-300">
          <Icon size={20} />
        </div>
      )}
      <div className="flex flex-col relative z-10">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          {title}
        </h3>
        <p className="text-3xl font-extrabold text-foreground mt-3 font-display">
          {value}
        </p>
        
        {(trend || trendLabel) && (
          <div className="flex items-center gap-1 mt-3">
            {trend && (
              <>
                {isUp ? (
                  <TrendingUp size={16} className="text-primary" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
                <span className={cn(
                  'text-sm font-bold',
                  isUp ? 'text-primary' : 'text-red-500'
                )}>
                  {trend}
                </span>
              </>
            )}
            <span className="text-xs text-muted-foreground ml-1">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
