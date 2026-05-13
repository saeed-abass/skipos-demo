'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const firstKeyRef = useRef<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)

      if (isInput) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      // Single key: / focuses search
      if (key === '/') {
        e.preventDefault()
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement | null
        searchInput?.focus()
        return
      }

      // Two-key sequences — first key
      if (!firstKeyRef.current) {
        if (key === 'g' || key === 'n') {
          firstKeyRef.current = key
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => {
            firstKeyRef.current = null
          }, 500)
        }
        return
      }

      // Second key
      const combo = firstKeyRef.current + key
      firstKeyRef.current = null
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      switch (combo) {
        case 'gd': router.push('/dashboard'); break
        case 'gj': router.push('/jobs'); break
        case 'gc': router.push('/customers'); break
        case 'gw': router.push('/wtns'); break
        case 'nj': window.dispatchEvent(new CustomEvent('skipos:open-new-job')); break
        case 'nc': window.dispatchEvent(new CustomEvent('skipos:open-new-customer')); break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])
}
