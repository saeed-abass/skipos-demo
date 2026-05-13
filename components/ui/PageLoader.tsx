'use client'

import { useEffect, useState } from 'react'

interface PageLoaderProps {
  visible: boolean
}

export function PageLoader({ visible }: PageLoaderProps) {
  // mounted controls whether we're in the DOM at all
  const [mounted, setMounted] = useState(visible)

  useEffect(() => {
    if (visible) {
      setMounted(true)
    } else {
      // Wait for exit fade (200ms) before unmounting
      const t = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(t)
    }
  }, [visible])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-white transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Logo */}
      <div
        className="flex flex-col items-center gap-2 transition-all duration-[400ms] ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        {/* Skip icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="h-12 w-12"
          fill="none"
        >
          {/* Skip body */}
          <path
            d="M6 32 L10 16 H38 L42 32 Z"
            fill="url(#skip-gradient)"
          />
          {/* Wheels */}
          <circle cx="14" cy="33" r="4" fill="#d1d5db" />
          <circle cx="14" cy="33" r="2" fill="#6b7280" />
          <circle cx="34" cy="33" r="4" fill="#d1d5db" />
          <circle cx="34" cy="33" r="2" fill="#6b7280" />
          {/* Ribs */}
          <line x1="18" y1="16.5" x2="16" y2="31.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <line x1="24" y1="16.5" x2="24" y2="31.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <line x1="30" y1="16.5" x2="32" y2="31.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <defs>
            <linearGradient id="skip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>

        {/* Wordmark */}
        <span className="text-xl font-bold text-soft-text">
          Skip<span className="text-orange-500">OS</span>
        </span>
      </div>

      {/* Loading bar */}
      <div className="h-[3px] w-48 overflow-hidden rounded-full bg-gray-100">
        <div className="animate-loading-bar h-full w-full rounded-full bg-gradient-orange" />
      </div>
    </div>
  )
}
