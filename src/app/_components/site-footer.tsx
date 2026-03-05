const F = { ui: 'var(--font-franklin), Helvetica Neue, sans-serif' } as const

export default function SiteFooter() {
  return (
    <footer className="max-w-5xl mx-auto px-6 pt-8 pb-10 border-t border-[var(--color-rule)] flex flex-col sm:flex-row justify-between items-center gap-2">
      <p
        className="text-[9px] tracking-[0.3em] uppercase"
        style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
      >
        © {new Date().getFullYear()} Gastón Gutierrez · El Chenque
      </p>
      <p
        className="text-[9px] tracking-[0.2em] uppercase"
        style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
      >
        Artículos creados con IA, publicados sin ánimo de lucro.
      </p>
    </footer>
  )
}
