'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info'

export interface ToastOptions {
  type: ToastType
  title: string
  message?: string
}

interface ToastItem extends ToastOptions {
  id: string
  dismissing: boolean
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

// ─────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ─────────────────────────────────────────────────────────
// Individual toast card
// ─────────────────────────────────────────────────────────

const DISMISS_DURATION: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  error: 6000,
}

const BORDER_CLASS: Record<ToastType, string> = {
  success: 'border-l-green-500',
  info: 'border-l-blue-500',
  error: 'border-l-red-500',
}

const ICON_BG: Record<ToastType, string> = {
  success: 'bg-green-100 text-green-600',
  info: 'bg-blue-100 text-blue-600',
  error: 'bg-red-100 text-red-600',
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
    )
  }
  if (type === 'error') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  )
}

interface ToastCardProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const duration = DISMISS_DURATION[toast.type]

  return (
    <div
      className={cn(
        'relative w-[360px] overflow-hidden rounded-card bg-white shadow-soft-md border-l-[4px]',
        BORDER_CLASS[toast.type],
        'transition-[transform,opacity] duration-300 ease-out',
        toast.dismissing
          ? 'translate-y-2 opacity-0 duration-200'
          : 'translate-y-0 opacity-100'
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Icon */}
        <div className={cn('mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full', ICON_BG[toast.type])}>
          <ToastIcon type={toast.type} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-soft-text">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-xs text-soft-muted leading-relaxed">{toast.message}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-soft-muted hover:text-soft-text transition-colors"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div
        className={cn(
          'absolute bottom-0 left-0 h-[3px] w-full origin-left animate-shrink',
          toast.type === 'success' ? 'bg-green-400' : toast.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
        )}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, dismissing: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220)
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const showToast = useCallback((options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newToast: ToastItem = { ...options, id, dismissing: false }

    setToasts(prev => {
      const next = [...prev, newToast]
      return next.slice(-3)
    })

    const duration = DISMISS_DURATION[options.type]
    const timer = setTimeout(() => dismiss(id), duration)
    timers.current.set(id, timer)
  }, [dismiss])

  // cleanup on unmount
  useEffect(() => {
    const map = timers.current
    return () => { map.forEach(t => clearTimeout(t)) }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col-reverse items-end gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
