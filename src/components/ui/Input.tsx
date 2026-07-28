import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefix?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        {prefix ? (
          <div className={cn(
            'flex items-center w-full rounded-xl border bg-white overflow-hidden',
            'transition-all duration-200',
            'border-cream-400 focus-within:border-warm-400 focus-within:ring-2 focus-within:ring-warm-400/20',
            error && 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/20',
          )}>
            <span className="px-3 py-2.5 text-sm text-ink-400 bg-cream-50 border-r border-cream-300 whitespace-nowrap shrink-0">
              {prefix}
            </span>
            <input
              ref={ref}
              id={inputId}
              className={cn(
                'flex-1 px-3 py-2.5 bg-white text-ink-800 placeholder:text-ink-300',
                'outline-none min-w-0',
                className
              )}
              {...props}
            />
          </div>
        ) : (
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl border bg-white text-ink-800 placeholder:text-ink-300',
              'transition-all duration-200 outline-none',
              'border-cream-400 focus:border-warm-400 focus:ring-2 focus:ring-warm-400/20',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
              className
            )}
            {...props}
          />
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl border bg-white text-ink-800 placeholder:text-ink-300',
            'transition-all duration-200 outline-none resize-none',
            'border-cream-400 focus:border-warm-400 focus:ring-2 focus:ring-warm-400/20',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
