import { useEffect, useRef, useState } from 'react'

const metiers = [
  {
    id: 'sculpture',
    name: 'Sculpture',
    code: 'SCU',
    artisans: 42,
    accent: '#C3622D',
    description: 'Art ancestral du bois et de la pierre. Masques baoulé et dan transmis sur quatre générations.',
    image: 'https://picsum.photos/seed/asp-sculpture/900/1200',
    fallback: 'https://placehold.co/900x1200/C3622D/F6E7DD/png?text=Sculpture',
  },
  {
    id: 'tressage',
    name: 'Tressage',
    code: 'TRE',
    artisans: 38,
    accent: '#A55427',
    description: 'Paniers, nattes et objets décoratifs tressés à la main avec patience et précision.',
    image: 'https://picsum.photos/seed/asp-tressage/900/1200',
    fallback: 'https://placehold.co/900x1200/A55427/F6E7DD/png?text=Tressage',
  },
  {
    id: 'tissage',
    name: 'Tissage',
    code: 'TIS',
    artisans: 51,
    accent: '#864521',
    description: 'Pagnes Baoulé, bogolans et textiles aux motifs géométriques chargés de symbolisme.',
    image: 'https://picsum.photos/seed/asp-tissage/900/1200',
    fallback: 'https://placehold.co/900x1200/864521/F6E7DD/png?text=Tissage',
  },
  {
    id: 'poterie',
    name: 'Poterie',
    code: 'POT',
    artisans: 29,
    accent: '#C3622D',
    description: 'Modelée à la main dans la terre argileuse locale, cuite au bois selon des techniques millénaires.',
    image: 'https://picsum.photos/seed/asp-poterie/900/1200',
    fallback: 'https://placehold.co/900x1200/C3622D/F6E7DD/png?text=Poterie',
  },
  {
    id: 'forge',
    name: 'Forge',
    code: 'FOR',
    artisans: 18,
    accent: '#864521',
    description: 'Bracelets, couteaux cérémoniels et outils forgés au charbon de bois selon les rites Akan.',
    image: 'https://picsum.photos/seed/asp-forge/900/1200',
    fallback: 'https://placehold.co/900x1200/864521/F6E7DD/png?text=Forge',
  },
  {
    id: 'peinture',
    name: 'Peinture',
    code: 'PNT',
    artisans: 22,
    accent: '#A55427',
    description: "Toiles expressives aux pigments naturels qui capturent l'âme des villages ivoiriens.",
    image: 'https://picsum.photos/seed/asp-peinture/900/1200',
    fallback: 'https://placehold.co/900x1200/A55427/F6E7DD/png?text=Peinture',
  },
]

export function MetiersDeckSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number
    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const section = sectionRef.current
        if (!section) return
        const rect = section.getBoundingClientRect()
        const scroll = window.scrollY || window.pageYOffset
        const sectionTop = scroll + rect.top
        const sectionRange = section.offsetHeight - window.innerHeight
        const raw = (scroll - sectionTop) / sectionRange
        setProgress(Math.max(0, Math.min(1, raw)))
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const cardRange = 1 / metiers.length
  const activeIndex = Math.min(Math.floor(progress / cardRange), metiers.length - 1)

  return (
    <section ref={sectionRef} className="relative h-[320vh] sm:h-[350vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col bg-surface">
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
              {String(activeIndex + 1).padStart(2, '0')}
            </p>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              / 06
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative px-4 sm:px-8 pb-8">
          {metiers.map((metier, i) => {
            const cardStart = i * cardRange
            const cardEnd = (i + 1) * cardRange
            const cardProgress = (progress - cardStart) / cardRange
            const clamped = Math.max(0, Math.min(1, cardProgress))
            const isPast = progress >= cardEnd
            const isActive = i === activeIndex
            const stackOffset = i - activeIndex

            let transform = ''
            let opacity = 1
            let zIndex = metiers.length - i

            if (isPast) {
              transform = `translate(-150%, -10%) rotate(-30deg) scale(0.8)`
              opacity = 0
            } else if (isActive) {
              const swipeX = clamped * -150
              const swipeRot = clamped * -30
              const swipeY = clamped * -10
              const swipeScale = 1 - clamped * 0.2
              const swipeOpacity = clamped > 0.7 ? 1 - (clamped - 0.7) / 0.3 : 1
              transform = `translate(${swipeX}%, ${swipeY}%) rotate(${swipeRot}deg) scale(${swipeScale})`
              opacity = swipeOpacity
              zIndex = 100
            } else if (stackOffset > 0) {
              const stackTransform = Math.min(stackOffset, 3)
              const rotateDeg = stackTransform * (stackTransform % 2 === 0 ? -2 : 2)
              const translateY = stackTransform * 10
              const scale = 1 - stackTransform * 0.04
              transform = `translateY(${translateY}px) rotate(${rotateDeg}deg) scale(${scale})`
              opacity = stackTransform > 3 ? 0 : 1 - stackTransform * 0.15
              zIndex = metiers.length - stackTransform
            }

            return (
              <div
                key={metier.id}
                className="absolute w-[290px] sm:w-[380px] h-[420px] sm:h-[520px]"
                style={{
                  transform,
                  opacity,
                  zIndex,
                  transition: 'transform 0.08s linear, opacity 0.2s ease',
                  willChange: 'transform, opacity',
                }}
              >
                <div
                  className="w-full h-full rounded-[24px] overflow-hidden relative"
                  style={{ boxShadow: '0 30px 80px rgba(14,13,13,0.30)' }}
                >
                  <img
                    src={metier.image}
                    onError={(e) => { (e.target as HTMLImageElement).src = metier.fallback }}
                    alt={metier.name}
                    loading="eager"
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.85) sepia(0.15)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute top-6 left-6 w-1 h-12 rounded-full" style={{ background: metier.accent }} />
                  <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                    <p className="font-label text-[9px] uppercase tracking-widest text-white font-bold">{metier.code}</p>
                  </div>
                  <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8">
                    <h3 className="font-headline text-3xl sm:text-5xl italic text-white leading-none mb-3">{metier.name}</h3>
                    <p className="font-body text-xs sm:text-sm text-white/75 font-light leading-relaxed mb-4">
                      {metier.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full" style={{ background: metier.accent }} />
                      <p className="font-label text-[10px] uppercase tracking-widest text-white/60">
                        {metier.artisans} artisans actifs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-4 sm:px-8 pb-8 flex gap-2">
          {metiers.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-outline-variant/20 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: i < activeIndex ? '100%' : i === activeIndex ? '50%' : '0%',
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