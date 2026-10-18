import { useEffect, useRef, useState } from 'react'
import { useProducts, type ProductUI } from '@/hooks/useProducts'

function pickShowcase(all: ProductUI[], n: number): ProductUI[] {
  const byCat = new Map<string, ProductUI[]>()
  ;[...all]
    .filter((p) => p.image)
    .sort((a, b) => b.rating - a.rating || a.date.localeCompare(b.date))
    .forEach((p) => {
      const list = byCat.get(p.category) ?? []
      list.push(p)
      byCat.set(p.category, list)
    })
  const queues = [...byCat.values()]
  const picked: ProductUI[] = []
  while (picked.length < n && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift()
      if (next) picked.push(next)
      if (picked.length >= n) break
    }
  }
  return picked
}

const ACCENT_BY_CATEGORY: Record<string, string> = {
  Sculpture: '#C3622D', Tressage: '#A55427', Tissage: '#864521',
  Poterie: '#C3622D', Forge: '#864521', Peinture: '#A55427',
  Bijouterie: '#864521', Botterie: '#5C3A1E', Accessoires: '#A55427',
  Sérigraphie: '#C3622D',
}

export function PinnedProductsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [sectionHeight, setSectionHeight] = useState('400vh')
  const { data: realProducts = [] } = useProducts()
  // 8 pièces : les mieux notées, en alternant les métiers
  const products = pickShowcase(realProducts, 8).map((p) => ({
    name: p.name,
    artisan: p.artisan,
    price: p.price.toLocaleString('fr-FR'),
    category: p.category,
    badge: p.badge ?? '',
    accent: ACCENT_BY_CATEGORY[p.category] || '#C3622D',
    image: p.image,
  }))

  useEffect(() => {
    const update = () => setSectionHeight(window.innerWidth < 768 ? '260vh' : '300vh')
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    let rafId: number
    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const section = sectionRef.current
        const track = trackRef.current
        if (!section || !track) return
        const rect = section.getBoundingClientRect()
        const scrollY = window.scrollY || window.pageYOffset
        const sectionTop = scrollY + rect.top
        const viewportHeight = window.innerHeight
        const sectionHeight = section.offsetHeight - viewportHeight
        const maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth + 100)
        if (scrollY < sectionTop) {
          track.style.transform = 'translate3d(0px, 0, 0)'
        } else if (scrollY > sectionTop + sectionHeight) {
          track.style.transform = `translate3d(${-maxTranslate}px, 0, 0)`
        } else {
          const progress = (scrollY - sectionTop) / sectionHeight
          track.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`
        }
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sectionHeight, products.length])

  if (products.length < 2) return null

  return (
    <section ref={sectionRef} className="relative" style={{ height: sectionHeight, background: '#fcf9f4' }}>
      <div style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="px-4 sm:px-8 mb-8 flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-600 mb-1">NOS CRÉATIONS · COUP DE COEUR</p>
            <h2 className="text-2xl sm:text-3xl italic font-serif">
              Pièces <span style={{ color: '#C3622D' }}>Phares</span>
            </h2>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-stone-600">Faites défiler →</p>
        </div>

        <div
          ref={trackRef}
          className="gap-4 sm:gap-6 px-4 sm:px-8"
          style={{
            display: 'flex',
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {products.map((p, i) => (
            <div
              key={i}
              className="w-[240px] sm:w-[320px] flex-shrink-0"
              style={{
                marginTop: i % 2 === 0 ? '0' : '40px',
                background: '#ffffff',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(14,13,13,0.12)',
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: p.image ? '#f0ede9' : p.accent }}>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.95) sepia(0.1)' }}
                  />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Oswald, sans-serif', fontStyle: 'italic',
                    color: '#F6E7DD', fontSize: '28px', letterSpacing: '0.05em',
                  }}>
                    {p.category}
                  </div>
                )}
                {p.badge && (
                  <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    background: 'rgba(252,249,244,0.94)',
                    padding: '6px 12px', borderRadius: '9999px',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em',
                    color: '#C3622D', textTransform: 'uppercase',
                  }}>
                    {p.badge}
                  </div>
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: p.accent, marginBottom: '4px' }}>
                  {p.category}
                </p>
                <h3 style={{ fontSize: '18px', fontStyle: 'italic', fontFamily: 'Oswald, sans-serif', lineHeight: 1.2 }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: '10px', color: '#56433a', marginTop: '4px' }}>{p.artisan}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <span style={{ fontSize: '20px', fontFamily: 'Oswald, sans-serif', color: '#C3622D' }}>
                    {p.price} FCFA
                  </span>
                  <button style={{
                    width: '40px', height: '40px', borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #C3622D, #D28962)',
                    color: 'white', fontSize: '18px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer',
                  }}>
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ flexShrink: 0, width: '64px' }} />
        </div>
      </div>
    </section>
  )
}