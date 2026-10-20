import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WorldCanvas from './components/WorldCanvas'
import Hud from './components/Hud'
import About from './world/About'
import Skills from './world/Skills'
import Projects from './world/Projects'
import Experience from './world/Experience'
import Achievements from './world/Achievements'
import Contact from './world/Contact'
import { reducedMotion } from './lib/store'

gsap.registerPlugin(ScrollTrigger)

export default function Site({ onReplay }) {
  useEffect(() => {
    const reduced = reducedMotion()
    let lenis, tick, ctx
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.1 })
      window.__lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
      // stepped (pixel-style) reveal for every .reveal block
      ctx = gsap.context(() => {
        gsap.set('.reveal', { opacity: 0, y: 32 })
        ScrollTrigger.batch('.reveal', {
          start: 'top 92%', once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'steps(6)', clearProps: 'transform' }),
        })
      })
    }
    const r = setTimeout(() => ScrollTrigger.refresh(), 700)
    return () => {
      clearTimeout(r); ctx?.revert(); ScrollTrigger.getAll().forEach((s) => s.kill())
      if (tick) gsap.ticker.remove(tick)
      lenis?.destroy(); window.__lenis = null
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <WorldCanvas />
      <Hud />
      <main id="main" className="site">
        <About /><Skills /><Projects /><Experience /><Achievements /><Contact onReplay={onReplay} />
      </main>
    </>
  )
}
