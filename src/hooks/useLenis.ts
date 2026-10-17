import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

// Global lenis instance accessible across components
export let lenisInstance: Lenis | null = null

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
    })

    lenisInstance = lenis

    // Like Locomotive's scrollCallback — track direction
    let lastProgress = 0
    lenis.on('scroll', ({ progress }: { progress: number }) => {
      const direction = progress > lastProgress ? '1' : '-1'
      document.documentElement.style.setProperty('--scroll-direction', direction)
      document.documentElement.style.setProperty('--scroll-progress', String(progress))
      lastProgress = progress
    })

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