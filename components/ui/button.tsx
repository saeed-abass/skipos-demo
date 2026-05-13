import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

// Soft UI button style: small, uppercase, bold, gradient backgrounds
const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-orange text-white shadow-soft hover:shadow-md active:opacity-90',
  secondary:
    'bg-white border border-gray-200 text-soft-text hover:bg-gray-50 shadow-soft active:opacity-90',
  danger:
    'bg-gradient-danger text-white shadow-soft hover:shadow-md active:opacity-90',
  ghost:
    'bg-transparent text-soft-muted hover:bg-gray-100 hover:text-soft-text',
  outline:
    'border-2 border-orange-500 text-orange-500 hover:bg-gradient-orange hover:text-white hover:border-transparent active:opacity-90',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-4 text-[0.65rem]',
  md: 'h-9 px-6 text-[0.75rem]',
  lg: 'h-11 px-8 text-[0.8rem]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Soft UI base: small caps, bold, tight tracking
          'inline-flex items-center justify-center gap-2 rounded-btn',
          'font-bold uppercase tracking-[0.025em]',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="h-3.5 w-3.5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
