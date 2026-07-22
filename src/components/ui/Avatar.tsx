import * as React from 'react'
import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-lg' },
  xl: { container: 'w-20 h-20', text: 'text-2xl' },
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const { container, text } = sizeMap[size]

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden bg-cream-200', container, className)}>
        <Image
          src={src}
          alt={name || 'ユーザー'}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-warm-200 flex items-center justify-center text-warm-700 font-semibold',
        container,
        text,
        className
      )}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}
