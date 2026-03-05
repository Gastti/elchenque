const F = {
  headline: 'var(--font-playfair), Georgia, serif',
  ui:       'var(--font-franklin), Helvetica Neue, sans-serif',
} as const

export default function SiteHeader() {
  return (
    <header className="max-w-5xl mx-auto px-6 pt-10 pb-0 mb-20">
      {/* Title + subtitle on left, logo spans full height on right */}
      <div className="flex justify-between mb-4">
        <div className="flex flex-col justify-between gap-2">
          <h1
            className="font-bold leading-none"
            style={{ fontFamily: F.headline, fontSize: 'clamp(1.8rem, 5vw, 2.8rem)' }}
          >
            El Chenque
          </h1>
          <p
            className="text-[11px] tracking-[0.25em] uppercase"
            style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
          >
            Noticias locales de Comodoro Rivadavia · Generadas con inteligencia artificial
          </p>
        </div>

        {/* Logo — altura igual al bloque de texto */}
        <div className="self-stretch flex items-center pl-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/elchenque-logo.png"
            alt="El Chenque"
            className="h-full w-auto object-contain max-h-14"
          />
        </div>
      </div>
    </header>
  )
}
