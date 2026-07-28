import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variantClasses = {
  primary:  'bg-warm-500 text-white hover:bg-warm-600 active:bg-warm-700 shadow-soft hover:shadow-card',
  secondary:'bg-cream-200 text-ink-700 hover:bg-cream-300 border border-cream-400',
  ghost:    'text-ink-600 hover:bg-cream-200 hover:text-ink-800',
  danger:   'bg-red-500 text-white hover:bg-red-600',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

type Variant = keyof typeof variantClasses
type Size = keyof typeof sizeClasses

// href が指定された場合は Link として描画（Server Component でも使用可能）
interface ButtonLinkProps {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

// href がない場合は button として描画
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
