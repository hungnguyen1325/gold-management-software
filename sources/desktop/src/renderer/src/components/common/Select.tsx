import React, { forwardRef } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, leftIcon, className = '', id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 select-none">
            {label}
            {props.required && <span className="ml-1 text-rose-500">*</span>}
          </label>
        )}
        <div
          className={`relative flex items-center rounded-lg border bg-white transition-all shadow-2xs ${
            error
              ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100'
              : 'border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100'
          } ${disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : ''}`}
        >
          {leftIcon && <span className="pl-3 text-slate-400 flex items-center">{leftIcon}</span>}
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-hidden disabled:cursor-not-allowed cursor-pointer ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
