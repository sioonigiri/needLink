import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ className, children, padding = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card',
        padding && 'p-6 sm:p-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('p-6 sm:p-8 pb-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn('px-6 sm:px-8 pb-6 sm:pb-8', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'px-6 sm:px-8 py-4 border-t border-nl-card-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
