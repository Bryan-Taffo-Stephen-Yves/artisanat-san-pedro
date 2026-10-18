import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import imgBotterie from '@/assets/metiers/botterie.webp'
import imgBijouterie from '@/assets/metiers/bijouterie.webp'
import imgPeinture from '@/assets/metiers/peinture.webp'
import imgSculpture from '@/assets/metiers/sculpture.webp'
import imgAccessoires from '@/assets/metiers/accessoires.webp'
import imgTressage from '@/assets/metiers/tressage.webp'
import imgSerigraphie from '@/assets/metiers/serigraphie.webp'

// Les 7 corps de métiers réellement représentés par les artisans PACTE.
// Photos : créations réelles des artisans de San Pedro.
const metiers = [
  {
    id: 'botterie', name: 'Botterie', category: 'Botterie', code: 'BOT', accent: '#C3622D', image: imgBotterie,
    description: 'Chaussures, sandales et articles en cuir façonnés à la main par les bottiers de San Pedro.',
  },
  {
    id: 'bijouterie', name: 'Bijouterie', category: 'Bijouterie', code: 'BIJ', accent: '#A55427', image: imgBijouterie,
    description: 'Colliers, pendentifs, bracelets et bagues ciselés en argent et métaux par nos bijoutiers.',
  },
  {
    id: 'peinture', name: 'Peinture', category: 'Peinture', code: 'PNT', accent: '#864521', image: imgPeinture,
    description: 'Toiles colorées inspirées de la vie, des traditions et des paysages de la côte ivoirienne.',
  },
  {
    id: 'sculpture', name: 'Sculpture', category: 'Sculpture', code: 'SCU', accent: '#C3622D', image: imgSculpture,
    description: 'Statues, masques et figures taillés dans le bois selon un savoir-faire transmis de génération en génération.',
  },
  {
    id: 'accessoires', name: 'Accessoires', category: 'Accessoires', code: 'ACC', accent: '#A55427', image: imgAccessoires,
    description: 'Sacs, bandeaux et parures en pagne wax, cousus et assemblés à la main.',
  },
  {
    id: 'tressage', name: 'Vannerie & Tressage', category: 'Tressage', code: 'TRE', accent: '#864521', image: imgTressage,
    description: 'Mobilier, luminaires et objets en rotin et fibres naturelles tressés selon les techniques ancestrales.',
  },
  {
    id: 'serigraphie', name: 'Sérigraphie', category: 'Sérigraphie', code: 'SER', accent: '#C3622D', image: imgSerigraphie,
    description: 'Impression artisanale sur textile : t-shirts, tenues et créations personnalisées.',
  },
]

const TOTAL = metiers.length
// Distance de scroll par carte (en vh) : assez court pour rester dynamique
const SCROLL_PER_CARD_VH = 32

export function MetiersDeckSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const barRefs = useRef<(HTMLDivElement | null)[]>([])
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Hauteur de fenêtre figée (mise à jour seulement si la largeur change) :
    // évite les sauts quand la barre d'adresse mobile apparaît / disparaît.
    let viewportH = window.innerHeight
    let lastW = window.innerWidth
    let lastActive = -1
    let rafId = 0

    const render = () => {
      rafId = 0
      const rect = section.getBoundingClientRect()
      const range = section.offsetHeight - viewportH
      const progress = range > 0 ? Math.max(0, Math.min(1, -rect.top / range)) : 0
      const cardRange = 1 / TOTAL
      const active = Math.min(Math.floor(progress / cardRange), TOTAL - 1)

      for (let i = 0; i < TOTAL; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        const local = Math.max(0, Math.min(1, (progress - i * cardRange) / cardRange))
        let transform: string
        let opacity = 1
        let z = TOTAL - i
        if (i < active) {
          transform = 'translate3d(-150%, -10%, 0) rotate(-30deg) scale(0.8)'
          opacity = 0
        } else if (i === active) {
          // La dernière carte reste en place
          const t = i === TOTAL - 1 ? 0 : local
          transform = `translate3d(${t * -150}%, ${t * -10}%, 0) rotate(${t * -30}deg) scale(${1 - t * 0.2})`
          opacity = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1
          z = 100
        } else {
          const depth = Math.min(i - active, 3)
          const rot = depth * (depth % 2 === 0 ? -2 : 2)
          transform = `translate3d(0, ${depth * 10}px, 0) rotate(${rot}deg) scale(${1 - depth * 0.04})`
          opacity = i - active > 3 ? 0 : 1 - depth * 0.15
        }
        el.style.transform = transform
        el.style.opacity = String(opacity)
        el.style.zIndex = String(z)
        el.style.pointerEvents = i === active ? 'auto' : 'none'
      }

      if (active !== lastActive) {
        lastActive = active
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
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `calc(100svh + ${TOTAL * SCROLL_PER_CARD_VH}vh)` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col bg-surface">
        <div className="px-4 sm:px-8 pt-24 pb-6 flex justify-between items-end">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              SAVOIR-FAIRE · SAN PEDRO
            </p>
            <h2 className="font-headline text-2xl sm:text-3xl italic">
              Nos Corps de <span className="text-primary">Métiers</span>
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
              / {String(TOTAL).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative px-4 sm:px-8 pb-8">
          {metiers.map((metier, i) => (
            <div
              key={metier.id}
              ref={(el) => { cardRefs.current[i] = el }}
              className="absolute w-[290px] sm:w-[380px] h-[420px] sm:h-[520px]"
              style={{ willChange: 'transform, opacity', zIndex: TOTAL - i }}
            >
              <Link
                to={`/boutique?cat=${encodeURIComponent(metier.category)}`}
                className="group block w-full h-full rounded-[24px] overflow-hidden relative"
                style={{ boxShadow: '0 24px 60px rgba(14,13,13,0.28)' }}
              >
                <img
                  src={metier.image}
                  alt={metier.name}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  width={760}
                  height={1040}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute top-6 left-6 w-1 h-12 rounded-full" style={{ background: metier.accent }} />
                <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-black/30 border border-white/20">
                  <p className="font-label text-[9px] uppercase tracking-widest text-white font-bold">{metier.code}</p>
                </div>
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8">
                  <h3 className="font-headline text-3xl sm:text-5xl italic text-white leading-none mb-3">{metier.name}</h3>
                  <p className="font-body text-xs sm:text-sm text-white/80 font-light leading-relaxed mb-4">
                    {metier.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white">
                    Voir les créations
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="px-4 sm:px-8 pb-8 flex gap-2">
          {metiers.map((m, i) => (
            <div key={m.id} className="flex-1 h-0.5 rounded-full bg-outline-variant/20 overflow-hidden">
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
