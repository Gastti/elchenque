'use client'

import { useState } from 'react'
import Link from 'next/link'

const F = { ui: 'var(--font-franklin), Helvetica Neue, sans-serif' } as const

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col justify-center gap-[5px] p-2 hover:opacity-50 transition-opacity"
        aria-label="Abrir menú"
      >
        <span className="block w-6 h-[1.5px] bg-[var(--color-ink)]" />
        <span className="block w-6 h-[1.5px] bg-[var(--color-ink)]" />
        <span className="block w-6 h-[1.5px] bg-[var(--color-ink)]" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/25 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-white z-50 shadow-2xl flex flex-col p-8 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button
          onClick={() => setOpen(false)}
          className="self-end text-xl leading-none hover:opacity-40 transition-opacity mb-12"
          aria-label="Cerrar menú"
          style={{ fontFamily: F.ui }}
        >
          ✕
        </button>
        <nav className="flex flex-col gap-6">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-base hover:opacity-40 transition-opacity tracking-wide"
            style={{ fontFamily: F.ui }}
          >
            Portada
          </Link>
        </nav>
      </div>
    </>
  )
}
