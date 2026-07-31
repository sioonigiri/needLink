import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefix?: string
  leftIcon?: React.ReactNode
  rightSlot?: React.ReactNode
}

const fieldShell = cn(
  'flex items-center w-full h-[52px] rounded-2xl border bg-white overflow-hidden',
  'border-nl-border transition-all duration-200',
  'focus-within:border-nl-primary focus-within:shadow-nl-focus'
)

const fieldInput = cn(
  'flex-1 h-full bg-transparent text-[15px] text-nl-text outline-none min-w-0',
  'placeholder:text-[#A8A29E]'
)

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, leftIcon, rightSlot, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-2.5">
        {label && (
          <label htmlFor={inputId} className="text-[14px] font-semibold text-nl-text">
            {label}
          </label>
        )}
        {prefix ? (
          <div
            className={cn(
              fieldShell,
              error && 'border-red-400 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
            )}
          >
            <span className="px-3 h-full flex items-center text-sm text-nl-muted bg-nl-beige border-r border-nl-border whitespace-nowrap shrink-0">
              {prefix}
            </span>
            <input
              ref={ref}
              id={inputId}
              className={cn(fieldInput, 'px-3', className)}
              {...props}
            />
          </div>
        ) : (
          <div
            className={cn(
              fieldShell,
              error && 'border-red-400 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
            )}
          >
            {leftIcon && (
              <span className="ml-4 shrink-0 text-[#9CA3AF]">{leftIcon}</span>
            )}
            <input
              ref={ref}
              id={inputId}
              className={cn(fieldInput, leftIcon ? 'px-3' : 'px-4', className)}
              {...props}
            />
            {rightSlot && <span className="mr-1.5 shrink-0">{rightSlot}</span>}
          </div>
        )}
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        {hint && !error && <p className="text-[13px] text-nl-muted">{hint}</p>}
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
      <div className="flex flex-col gap-2.5">
        {label && (
          <label htmlFor={inputId} className="text-[14px] font-semibold text-nl-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full min-h-[120px] px-4 py-3.5 rounded-2xl border bg-white text-[15px] text-nl-text',
            'border-nl-border placeholder:text-[#A8A29E]',
            'transition-all duration-200 outline-none resize-none',
            'focus:border-nl-primary focus:shadow-nl-focus',
            error && 'border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        {hint && !error && <p className="text-[13px] text-nl-muted">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
