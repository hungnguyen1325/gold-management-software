import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  prefixText?: string
  suffixText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 select-none">
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
          {prefixText && (
            <span className="pl-3 pr-1 text-xs font-medium text-slate-400 select-none">
              {prefixText}
            </span>
          )}
          {leftIcon && <span className="pl-3 text-slate-400 flex items-center">{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightIcon && <span className="pr-3 text-slate-400 flex items-center">{rightIcon}</span>}
          {suffixText && (
            <span className="pr-3 pl-1 text-xs font-medium text-slate-500 select-none">
              {suffixText}
            </span>
          )}
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

Input.displayName = 'Input'

export default Input
