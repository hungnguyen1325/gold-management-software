import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?:
    | string
    | {
        value: string | number
        isPositive?: boolean
        label?: string
      }
  trendType?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  iconBgColor?: string
  colorVariant?: 'rose' | 'emerald' | 'blue' | 'amber' | 'gold' | 'purple'
  accentColor?: string
  className?: string
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendType,
  icon,
  iconBgColor,
  colorVariant = 'amber',
  className = '',
  onClick
}) => {
  const variantMap: Record<string, string> = {
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    gold: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-50 text-purple-600'
  }

  const activeIconBg = iconBgColor || variantMap[colorVariant] || 'bg-amber-50 text-amber-600'
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-sm ${
        onClick ? 'cursor-pointer hover:border-amber-300' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{title}</span>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${activeIconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
      </div>

      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center text-xs">
          {typeof trend === 'string' ? (
            <span
              className={`font-semibold mr-1.5 flex items-center ${
                trendType === 'up'
                  ? 'text-emerald-600'
                  : trendType === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {trendType === 'up' && '↑ '}
              {trendType === 'down' && '↓ '}
              {trend}
            </span>
          ) : trend ? (
            <span
              className={`font-semibold mr-1.5 flex items-center ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          ) : null}
          <span className="text-slate-400">
            {typeof trend === 'object' ? trend?.label : subtitle}
          </span>
        </div>
      )}
    </div>
  )
}

export default StatCard
