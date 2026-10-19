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
          className="fixed inset-0 z-[10000] flex items-center justify-center px-6 overflow-y-auto"
          style={{ background: '#1A120C' }}
          initial={{ opacity: 1 }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
        >
          <div className="w-full max-w-md py-10 text-center">
            <motion.img
              src="/logo/logo-icone-terracotta.svg"
              alt=""
              className="h-14 w-auto mx-auto mb-6"
              variants={item}
              initial="hidden"
              animate="show"
              custom={0}
            />
            <motion.p
              className="text-[13px] font-semibold text-white/50 mb-3"
              variants={item}
              initial="hidden"
              animate="show"
              custom={1}
            >
              Programme PACTE · San Pedro
            </motion.p>
            <motion.h2
              id="welcome-title"
              className="font-serif text-4xl sm:text-5xl text-white leading-tight"
              variants={item}
              initial="hidden"
              animate="show"
              custom={2}
            >
              Bienvenue sur <span className="italic text-[#E8A27C]">Mains de San Pedro</span>
            </motion.h2>
            <motion.p
              className="text-sm font-light leading-relaxed text-white/70 mt-4"
              variants={item}
              initial="hidden"
              animate="show"
              custom={3}
            >
              La boutique en ligne des artisans de San Pedro, en Côte d&apos;Ivoire. Une
              initiative du PRIME à travers le programme PACTE, avec le soutien de la France.
              Chaque achat rémunère directement l&apos;artisan qui a créé la pièce.
            </motion.p>

            <ul className="mt-7 space-y-3 text-left">
              {points.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                  variants={item}
                  initial="hidden"
                  animate="show"
                  custom={4 + i}
                >
                  <span className="w-9 h-9 shrink-0 rounded-full bg-[#C3622D]/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#E8A27C]" strokeWidth={1.8} />
                  </span>
                  <span className="text-sm text-white/85 font-light">{text}</span>
                </motion.li>
              ))}
            </ul>

            <motion.button
              ref={buttonRef}
              onClick={close}
              className="mt-8 inline-flex items-center justify-center gap-2 h-12 w-full sm:w-auto px-8 rounded-full bg-primary hover:bg-[#8E4219] text-primary-foreground text-base font-semibold hover:opacity-90 active:scale-[0.97] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              variants={item}
              initial="hidden"
              animate="show"
              custom={7}
            >
              Entrer dans la boutique <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
