'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type State = 'idle' | 'loading' | 'completing'

export default function LoadingBar() {
  const pathname = usePathname()
  const [state, setState]       = useState<State>('idle')
  const [progress, setProgress] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  // Interceptar clicks en links internos → arrancar la barra
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return

      clear()
      setProgress(0)
      setState('loading')

      timers.current = [
        setTimeout(() => setProgress(25), 40),
        setTimeout(() => setProgress(55), 350),
        setTimeout(() => setProgress(78), 900),
      ]
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Completar cuando cambia el pathname (nueva página renderizada)
  useEffect(() => {
    if (state !== 'loading') return
    clear()
    setProgress(100)
    setState('completing')
    timers.current = [setTimeout(() => setState('idle'), 500)]
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'idle') return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '2px',
        background: '#ebebeb',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: '#111111',
          transition:
            state === 'completing'
              ? 'width 0.15s ease-out, opacity 0.35s ease 0.15s'
              : 'width 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: state === 'completing' ? 0 : 1,
        }}
      />
    </div>
  )
}
