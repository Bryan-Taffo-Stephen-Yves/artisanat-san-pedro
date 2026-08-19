import { useEffect, useState } from 'react'

export function Preloader() {
  const [phase, setPhase] = useState<'loading' | 'revealing' | 'done'>('loading')
  const [count, setCount] = useState(0)

  useEffect(() => {
    const countInterval = setInterval(() => {
      setCount(prev => {
        if (prev >= 100) {
          clearInterval(countInterval)
          setTimeout(() => setPhase('revealing'), 200)
          setTimeout(() => setPhase('done'), 1400)
          return 100
        }
        return prev + Math.floor(Math.random() * 8) + 2
      })
    }, 40)
    return () => clearInterval(countInterval)
  }, [])

  if (phase === 'done') return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
      style={{
        background: '#0E0D0D',
        clipPath: phase === 'revealing' ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)',
        transition: 'clip-path 1.2s cubic-bezier(0.77, 0, 0.175, 1)',
      }}
    >
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-6 font-sans">
          PROGRAMME PACTE · CÔTE D'IVOIRE
        </p>
        <img
          src="/logo/logo-vertical-terracotta.svg"
          alt="Mains de San Pedro"
          className="h-32 w-auto mx-auto"
        />
      </div>

      <div className="absolute bottom-12 left-0 right-0 px-8 flex justify-between items-end">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-sans">
          Chargement
        </p>
        <p className="font-serif text-6xl text-white/80 italic tabular-nums">
          {String(Math.min(count, 100)).padStart(2, '0')}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className="h-full bg-primary transition-all duration-100 ease-linear"
          style={{ width: `${Math.min(count, 100)}%` }}
        />
      </div>
    </div>
  )
}
