export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — branding ─────────────────────── */}
      <div className="relative hidden w-[45%] flex-col justify-center px-16 lg:flex gradient-navy">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
              <path d="M2 9h20l-2 10H4L2 9z" />
              <path d="M7 9V6h10v3" />
              <path d="M2 9l2-3" />
              <path d="M22 9l-2-3" />
            </svg>
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">
            Skip<span className="text-orange-400">OS</span>
          </span>
        </div>

        <p className="mt-4 text-lg text-white/80">
          The operating system for skip hire
        </p>

        {/* Divider */}
        <div className="my-10 border-t border-white/20" />

        {/* Feature bullets */}
        <div className="space-y-4">
          {[
            'DEFRA-compliant digital waste tracking',
            'Job scheduling and fleet management',
            'Built for UK skip hire operators',
          ].map(feature => (
            <div key={feature} className="flex items-center gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-orange-400">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/90">{feature}</p>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <p className="absolute bottom-8 left-16 text-xs text-white/50">
          Trusted by skip hire businesses across the UK
        </p>
      </div>

      {/* ── Right panel — form ────────────────────────── */}
      <div className="flex flex-1 flex-col bg-soft-bg px-4 py-8 lg:items-center lg:justify-center lg:px-8">
        {/* Mobile-only logo header */}
        <div className="mb-6 flex flex-col items-center lg:hidden">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="SkipOS" className="h-10 w-10" />
            <span className="text-2xl font-bold text-soft-text">
              Skip<span className="text-orange-500">OS</span>
            </span>
          </div>
          <p className="mt-2 text-sm text-soft-muted">The operating system for skip hire</p>
        </div>
        {children}
      </div>
    </div>
  )
}
