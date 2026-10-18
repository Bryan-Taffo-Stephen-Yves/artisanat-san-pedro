import { useEffect } from 'react'
import Lenis from 'lenis'

// Global lenis instance accessible across components
export let lenisInstance: Lenis | null = null

export function useLenis() {
  useEffect(() => {
    // Respecte le réglage système "réduire les animations"
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      // Interpolation douce mais réactive à la molette ; sur mobile le
      // défilement tactile reste natif (syncTouch désactivé par défaut),
      // c'est ce qui est le plus fluide sur téléphone.
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
    })

    lenisInstance = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])
}
