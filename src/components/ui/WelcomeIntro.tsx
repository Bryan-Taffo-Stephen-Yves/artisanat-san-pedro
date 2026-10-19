import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Users, Palette, Smartphone } from 'lucide-react'
import { useArtisans } from '@/hooks/useArtisans'
import { useProducts } from '@/hooks/useProducts'
import { lenisInstance } from '@/hooks/useLenis'

const STORAGE_KEY = 'pacte_welcome_seen'

function alreadySeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

// Écran de bienvenue affiché une fois par visiteur sur l'accueil :
// présente le projet en quelques lignes, sans bloquer le chargement du site.
export function WelcomeIntro() {
  const [open, setOpen] = useState(() => !alreadySeen())
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { data: artisans = [] } = useArtisans()
  const { data: products = [] } = useProducts()
  const metiers = new Set(artisans.map((a) => a.metierCategory)).size

  const close = () => {
    setOpen(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* navigation privée : on n'enregistre pas */
    }
  }

  useEffect(() => {
    if (!open) return
    // Lenis est créé juste après ce composant au premier rendu : on le
    // met en pause au tick suivant pour bloquer le scroll derrière l'écran.
    const stopTimer = setTimeout(() => lenisInstance?.stop(), 0)
    document.body.style.overflow = 'hidden'
    buttonRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(stopTimer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenisInstance?.start()
    }
  }, [open])

  const points = [
    {
      icon: Users,
      text: artisans.length
        ? `${artisans.length} artisans de San Pedro, ${metiers} corps de métiers`
        : 'Les artisans de San Pedro et leurs savoir-faire',
    },
    {
      icon: Palette,
      text: products.length
        ? `${products.length} créations faites main, vendues par leurs auteurs`
        : 'Des créations faites main, vendues par leurs auteurs',
    },
    { icon: Smartphone, text: 'Paiement simple, y compris par Mobile Money' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          className="fixed inset-0 z-[10000] overflow-y-auto"
          style={{ background: '#1A120C' }}
          initial={{ opacity: 1 }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
        >
          <div className="min-h-full flex flex-col items-center justify-center px-4 py-6 sm:py-8">
            <div className="w-full max-w-2xl text-center">
              <motion.img
                src="/logo/logo-icone-terracotta.svg"
                alt=""
                className="h-10 [@media(min-height:760px)]:h-12 w-auto mx-auto mb-4"
                variants={item}
                initial="hidden"
                animate="show"
                custom={0}
              />
              <motion.h2
                id="welcome-title"
                className="text-white leading-[1.08] text-[clamp(1.9rem,4.2vh+1rem,3.25rem)]"
                variants={item}
                initial="hidden"
                animate="show"
                custom={1}
              >
                Bienvenue sur <span className="text-[#F2B48C]">Mains de San Pedro</span>
              </motion.h2>
              <motion.p
                className="text-[15px] sm:text-base leading-relaxed text-white/75 mt-3 max-w-xl mx-auto"
                variants={item}
                initial="hidden"
                animate="show"
                custom={2}
              >
                La boutique en ligne des artisans de San Pedro, en Côte d&apos;Ivoire. Chaque achat
                rémunère directement l&apos;artisan qui a créé la pièce.
              </motion.p>

              <ul className="mt-5 grid gap-2 sm:grid-cols-3 text-left">
                {points.map(({ icon: Icon, text }, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center sm:items-start gap-3 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-3"
                    variants={item}
                    initial="hidden"
                    animate="show"
                    custom={3 + i}
                  >
                    <span className="w-8 h-8 shrink-0 rounded-full bg-[#C3622D]/25 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#F2B48C]" strokeWidth={1.8} />
                    </span>
                    <span className="text-sm leading-snug text-white/85">{text}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                ref={buttonRef}
                onClick={close}
                className="mt-6 inline-flex items-center justify-center gap-2 h-[52px] w-full sm:w-auto px-8 rounded-full bg-primary hover:bg-[#8E4219] text-white text-base font-semibold active:scale-[0.97] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                variants={item}
                initial="hidden"
                animate="show"
                custom={6}
              >
                Entrer dans la boutique <ArrowRight className="w-4 h-4" />
              </motion.button>

              {/* Partenaires du projet */}
              <motion.div
                className="mt-6"
                variants={item}
                initial="hidden"
                animate="show"
                custom={7}
              >
                <p className="text-[13px] text-white/60 mb-2.5">
                  Une initiative du PRIME, à travers le programme PACTE, avec le soutien de la France
                </p>
                <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl bg-white px-6 py-3.5">
                  <img src="/partenaires/pacte.webp" alt="PACTE" className="h-12 sm:h-14 w-auto object-contain" />
                  <img
                    src="/partenaires/prime.jpg"
                    alt="PRIME — Programme National d'Appui aux Réformes Institutionnelles et à la Modernisation de l'État"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                  <img
                    src="/partenaires/ministere-europe-affaires-etrangeres.jpg"
                    alt="Ministère de l'Europe et des Affaires étrangères — République française"
                    className="h-12 sm:h-14 w-auto object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
