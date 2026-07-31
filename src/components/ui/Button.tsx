import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const baseClasses =
  'inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-nl-primary/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'

const variantClasses = {
  primary:
    'bg-nl-primary text-white font-semibold rounded-full hover:bg-nl-primary-hover hover:-translate-y-px hover:shadow-nl-btn active:translate-y-0',
  secondary:
    'bg-white text-nl-text font-medium border border-nl-border rounded-2xl hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100',
  ghost:
    'bg-transparent text-nl-muted font-medium rounded-full hover:bg-nl-beige hover:text-nl-text',
  danger:
    'bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 hover:-translate-y-px hover:shadow-md active:translate-y-0',
}

const sizeClasses = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-[52px] px-6 text-[15px]',
}

type Variant = keyof typeof variantClasses
type Size = keyof typeof sizeClasses

interface ButtonLinkProps {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined
  variant?: Variant
  size?: Size
  loading?: boolean
}

type Props = ButtonLinkProps | ButtonProps

export function Button(props: Props) {
  const { variant = 'primary', size = 'md', className, children } = props
  const cls = cn(baseClasses, variantClasses[variant], sizeClasses[size], className)

  if ('href' in props && props.href !== undefined) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    )
  }

  const { loading, disabled, ...rest } = props as ButtonProps
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
