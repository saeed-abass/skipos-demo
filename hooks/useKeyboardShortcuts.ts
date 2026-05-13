'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

function isInInput(): boolean {
  const el = document.activeElement
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  )
}

export function useKeyboardShortcuts() {
  const router = useRouter()
  const firstKeyRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function clearFirst() {
      firstKeyRef.current = null
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      // '/' focuses the topbar search (single-key, no sequence)
      if (key === '/' && !firstKeyRef.current) {
        if (isInInput()) return
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('skipos:focus-search'))
        return
      }

      if (!firstKeyRef.current) {
        if ((key === 'n' || key === 'g') && !isInInput()) {
          firstKeyRef.current = key
          timerRef.current = setTimeout(clearFirst, 300)
        }
        return
      }

      // Second key of sequence
      const combo = firstKeyRef.current + key
      clearFirst()

      switch (combo) {
        case 'gd': router.push('/dashboard'); break
        case 'gj': router.push('/jobs');      break
        case 'gc': router.push('/customers'); break
        case 'gw': router.push('/wtns');      break
        case 'nj': window.dispatchEvent(new CustomEvent('skipos:open-new-job'));      break
        case 'nc': window.dispatchEvent(new CustomEvent('skipos:open-new-customer')); break
      }
    }

    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      clearFirst()
    }
  }, [router])
}
