'use client'

import { useEffect } from 'react'

interface Props {
  onClose: () => void
}

const SHORTCUTS: { label: string; keys: string[]; sep: string }[] = [
  { label: 'New Job',          keys: ['N', 'J'], sep: 'then' },
  { label: 'New Customer',     keys: ['N', 'C'], sep: 'then' },
  { label: 'Go to Dashboard',  keys: ['G', 'D'], sep: 'then' },
  { label: 'Go to Jobs',       keys: ['G', 'J'], sep: 'then' },
  { label: 'Go to Customers',  keys: ['G', 'C'], sep: 'then' },
  { label: 'Go to WTNs',       keys: ['G', 'W'], sep: 'then' },
  { label: 'Focus Search',     keys: ['/'],      sep: '' },
]

function Key({ k }: { k: string }) {
  return (
    <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-soft-text">
      {k}
    </kbd>
  )
}

export function KeyboardShortcutsModal({ onClose }: Props) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-fade-slide-up w-full max-w-sm overflow-hidden rounded-card bg-white shadow-soft-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-navy px-5 py-4">
          <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
        </div>

        {/* Body */}
        <div className="p-4">
          {SHORTCUTS.map(({ label, keys, sep }) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0"
            >
              <span className="text-sm text-soft-text">{label}</span>
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className="px-0.5 text-[0.65rem] text-soft-muted">{sep}</span>
                    )}
                    <Key k={k} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
