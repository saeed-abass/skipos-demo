'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export type ToastItem = { id: string; message: string; type: 'success' | 'error' }

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  return { toasts, showToast }
}

export function ToastList({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'flex min-w-[260px] max-w-[340px] items-start gap-3 rounded-card bg-white p-4 shadow-soft-md',
            'border-l-[4px]',
            toast.type === 'success' ? 'border-l-green-500' : 'border-l-red-500'
          )}
        >
          <div
            className={cn(
              'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
              toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            )}
          >
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-soft-text">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
