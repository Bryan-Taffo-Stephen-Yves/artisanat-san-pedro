import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useArtisans } from '@/hooks/useArtisans'
import ArtisanAvatar from '@/components/ArtisanAvatar'

function SanPedroCardBack({ accent = '#C3622D' }: { accent?: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, #1A2D1A 0%, ${accent} 50%, #864521 100%)`,
        position: 'relative',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'absolute', inset: '12px', border: '2px solid rgba(255, 220, 180, 0.4)', borderRadius: '14px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '18px', border: '1px solid rgba(255, 220, 180, 0.2)', borderRadius: '12px', pointerEvents: 'none' }} />
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
        <defs>
          <pattern id="kente" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20 L20 0 L40 20 L20 40 Z" stroke="#F6E7DD" strokeWidth="0.5" fill="none" />
            <circle cx="20" cy="20" r="2" fill="#F6E7DD" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kente)" />
      </svg>
      <div style={{ textAlign: 'center', marginTop: '20px', position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', letterSpacing: '0.3em', color: '#F6E7DD', textTransform: 'uppercase', margin: 0 }}>
          ARTISANAT SAN PEDRO
        </p>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', border: '2px solid rgba(255, 220, 180, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '1px solid rgba(255, 220, 180, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '48px', fontStyle: 'italic', fontWeight: 700, color: '#F6E7DD', margin: 0, letterSpacing: '-0.05em' }}>
              ASP
            </h1>
          </div>
          {[0, 90, 180, 270].map((angle) => (
            <div key={angle} style={{ position: 'absolute', width: '8px', height: '8px', background: '#F6E7DD', borderRadius: '50%', transform: `rotate(${angle}deg) translateY(-100px)` }} />
          ))}
        </div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontStyle: 'italic', fontSize: '12px', color: '#F6E7DD', marginTop: '20px', opacity: 0.8 }}>
          Programme PACTE
        </p>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', letterSpacing: '0.3em', color: '#F6E7DD', textTransform: 'uppercase', margin: 0 }}>
          CÔTE D'IVOIRE · 2026
        </p>
      </div>
    </div>
  )
}

const SCROLL_PER_CARD_VH = 32

export function ArtisansCardFlipSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([])
  const flipRefs = useRef<(HTMLDivElement | null)[]>([])
  const barRefs = useRef<(HTMLDivElement | null)[]>([])
  const counterRef = useRef<HTMLSpanElement>(null)
  const { data: realArtisans = [] } = useArtisans()
  const artisans = useMemo(
    () =>
      realArtisans.slice(0, 3).map((a) => ({
        id: a.id,
        slug: a.slug,
        name: a.name,
        metier: `Maître ${a.metier}`,
        since: `Depuis ${a.since}`,
        location: `${a.location}, Côte d'Ivoire`,
        bio: (a.bio || '').split('.')[0] + '.',
        accentColor: a.accentColor,
        image: a.avatar,
        initials: a.initials,
      })),
    [realArtisans]
  )

  const count = artisans.length

  // Animation pilotée directement sur le DOM (pas de setState à chaque frame)
  useEffect(() => {
    const section = sectionRef.current
    if (!section || count === 0) return

    let viewportH = window.innerHeight
    let lastW = window.innerWidth
    let lastActive = -1
    let rafId = 0

    const render = () => {
      rafId = 0
      const rect = section.getBoundingClientRect()
      const range = section.offsetHeight - viewportH
      const progress = range > 0 ? Math.max(0, Math.min(1, -rect.top / range)) : 0
      const cardRange = 1 / count
      const active = Math.min(Math.floor(progress / cardRange), count - 1)

      for (let i = 0; i < count; i++) {
        const local = Math.max(0, Math.min(1, (progress - i * cardRange) / cardRange))
        let flipDeg = 0
        if (local >= 0.7) flipDeg = 180
        else if (local > 0.3) flipDeg = ((local - 0.3) / 0.4) * 180
        const flip = flipRefs.current[i]
        if (flip) flip.style.transform = `rotateY(${flipDeg}deg)`
      }

      if (active !== lastActive) {
        lastActive = active
        wrapRefs.current.forEach((wrap, i) => {
          if (!wrap) return
          const isActive = i === active
          wrap.style.opacity = isActive ? '1' : '0'
          wrap.style.transform = i < active ? 'translateY(-100vh)' : isActive ? 'translateY(0)' : 'translateY(50px)'
          wrap.style.pointerEvents = isActive ? 'auto' : 'none'
        })
        if (counterRef.current) counterRef.current.textContent = String(active + 1).padStart(2, '0')
        barRefs.current.forEach((bar, i) => {
          if (bar) bar.style.width = i < active ? '100%' : i === active ? '50%' : '0%'
        })
      }
    }

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(render)
    }
    const onResize = () => {
      if (window.innerWidth !== lastW) {
        lastW = window.innerWidth
        viewportH = window.innerHeight
      }
      onScroll()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    render()
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [count])

  if (count === 0) return null

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface-container-low"
      style={{ height: `calc(100svh + ${count * SCROLL_PER_CARD_VH}vh)` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col">
        <div className="px-4 sm:px-8 pt-24 pb-4 flex justify-between items-end">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              NOS CRÉATEURS
            </p>
            <h2 className="font-headline text-2xl sm:text-3xl italic">
              L'Âme derrière <span className="text-primary">l'Œuvre</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1 sm:hidden">
              Faites défiler
            </p>
            <p className="font-headline text-4xl sm:text-5xl text-primary/20 italic tabular-nums">
              <span ref={counterRef}>01</span>
            </p>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              / {String(count).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-8" style={{ perspective: '1500px' }}>
          {artisans.map((artisan, i) => {
            return (
              <div
                key={artisan.id}
                ref={(el) => { wrapRefs.current[i] = el }}
                className="absolute"
                style={{
                  opacity: i === 0 ? 1 : 0,
                  transform: i === 0 ? 'translateY(0)' : 'translateY(50px)',
                  transition: 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: i === 0 ? 'auto' : 'none',
                  perspective: '1500px',
                }}
              >
                <div
                  ref={(el) => { flipRefs.current[i] = el }}
                  className="w-[280px] h-[420px] sm:w-[340px] sm:h-[500px]"
                  style={{
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 30px 80px rgba(14,13,13,0.25)',
                    }}
                  >
                    <SanPedroCardBack accent={artisan.accentColor} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 30px 80px rgba(14,13,13,0.25)',
                    }}
                  >
                    <Link
                      to={`/artisans/${artisan.slug}`}
                      className="group cursor-pointer relative w-full h-full block"
                    >
                      <ArtisanAvatar
                        src={artisan.image}
                        initials={artisan.initials}
                        accentColor={artisan.accentColor}
                        name={artisan.name}
                        className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      {/* Hover badge — only visible when card is fully flipped + hovered */}
                      <div className="absolute top-4 right-4 glass-card px-3 py-1.5 rounded-full text-[9px] uppercase tracking-wider font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                        Voir le profil
                        <span>→</span>
                      </div>
                      <div className="absolute top-6 left-6 w-1 h-12 rounded-full" style={{ background: artisan.accentColor }} />
                      <div className="absolute bottom-7 left-7 right-7">
                        <p
                          className="font-label text-[10px] uppercase tracking-widest mb-2"
                          style={{ color: artisan.accentColor === '#C3622D' ? '#FFB693' : '#FFF' }}
                        >
                          {artisan.metier}
                        </p>
                        <h3 className="font-headline text-3xl italic text-white leading-tight mb-2">
                          {artisan.name}
                        </h3>
                        <p className="font-body text-xs text-white/70 font-light mb-3">
                          {artisan.since} · {artisan.location}
                        </p>
                        <p className="font-body text-sm text-white/80 font-light leading-relaxed">
                          {artisan.bio}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-8 pb-8 flex gap-2">
          {artisans.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-outline-variant/20 overflow-hidden">
              <div
                ref={(el) => { barRefs.current[i] = el }}
                className="h-full rounded-full"
                style={{
                  width: i === 0 ? '50%' : '0%',
                  background: 'linear-gradient(90deg, #C3622D, #D28962)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}