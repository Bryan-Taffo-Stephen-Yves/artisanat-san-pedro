import { useEffect, useRef, useState } from 'react'
import { lenisInstance } from '../../hooks/useLenis'

const CRAFT_NAMES = [
  'Sculpture',
  'Tressage',
  'Tissage',
  'Poterie',
  'Peinture',
  'Bijouterie',
  'Botterie',
  'Accessoires',
  'Sérigraphie',
]

export function Cascade() {
  const ref = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScroll = ({ scroll }: { scroll: number }) => {
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight

      const start = rect.top + scroll - windowH
      const end = rect.bottom + scroll - windowH * 0.2
      const rawProgress = (scroll - start) / (end - start)
      const progress = Math.max(0, Math.min(1, rawProgress))

      const index = Math.min(
        Math.floor(progress * CRAFT_NAMES.length),
        CRAFT_NAMES.length - 1
      )
      setActiveIndex(index)
    }

    lenisInstance?.on('scroll', handleScroll)
    return () => { lenisInstance?.off('scroll', handleScroll) }
  }, [])

  return (
    <div ref={ref} className="s-cascade py-12 px-6 overflow-hidden">
      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-6">
        Nos Corps de Métiers
      </p>
      <div className="relative h-32 overflow-hidden">
        {CRAFT_NAMES.map((name, i) => (
          <div
            key={name}
            className="absolute inset-0 flex items-center"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              transform: `translateY(${(i - activeIndex) * 40}px)`,
              transition: 'opacity 0.4s ease, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            <span className="font-headline text-6xl italic text-on-surface">
              {name}
            </span>
          </div>
        ))}
      </div>
      <p className="font-body text-sm text-on-surface-variant font-light mt-4">
        Chaque métier, une tradition. Chaque pièce, une histoire.
      </p>
    </div>
  )
}
