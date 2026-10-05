import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  leftIcon,
  icon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const activeLoading = isLoading || loading
  const activeLeftIcon = leftIcon || icon
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-offset-1 select-none active:scale-[0.98]'

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  }

  const variantClasses = {
    primary:
      'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500 border border-amber-600 hover:border-amber-700',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-200',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500 border border-emerald-600',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500 border border-rose-600',
    warning:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-xs focus:ring-amber-400 border border-amber-500',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-400',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent'
  }

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none shadow-none active:scale-100'

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled || activeLoading ? disabledClasses : ''
      } ${className}`}
      disabled={disabled || activeLoading}
      {...props}
    >
      {activeLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        activeLeftIcon
      )}
      <span>{children}</span>
      {!activeLoading && rightIcon}
    </button>
  )
}

export default Button
