const F = {
  headline: 'var(--font-playfair), Georgia, serif',
  ui:       'var(--font-franklin), Helvetica Neue, sans-serif',
} as const

export default function SiteHeader() {
  return (
    <header className="max-w-5xl mx-auto px-6 pt-6 md:pt-10 pb-0 mb-10 md:mb-20">
      {/* Title + subtitle on left, logo on right */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex flex-col justify-between gap-1.5 md:gap-2 min-w-0">
          <h1
            className="font-bold leading-none"
            style={{ fontFamily: F.headline, fontSize: 'clamp(1.5rem, 5.5vw, 2.8rem)' }}
          >
            El Chenque
          </h1>
          <p
            className="text-[10px] md:text-[11px] tracking-[0.18em] md:tracking-[0.25em] uppercase"
            style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
          >
            <span>Actualidad local, patagónica y nacional.</span>
          </p>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/elchenque-logo.png"
            alt="El Chenque"
            className="w-auto object-contain h-9 md:h-14"
          />
        </div>
      </div>

      {/* Regla separadora */}
      <div className="h-px bg-[var(--color-ink)]" />
    </header>
  )
}
