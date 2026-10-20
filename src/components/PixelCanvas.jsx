import { useEffect, useRef } from 'react'
import { pointer } from '../lib/pointer'
import { sfx } from '../lib/audio'
import { store } from '../lib/store'

/**
 * Generic low-res canvas runner.
 *  make(api) -> { tick(dt, t), click?() }
 *  api: { ctx, w, h, mouse{x,y,near,inside,down}, live (ref to latest props), sfx, snd, score }
 * Pauses automatically when off-screen / tab hidden.
 */
export default function PixelCanvas({ w, h, make, className = '', style, dim = false, label, ...live }) {
  const ref = useRef(null)
  const liveRef = useRef({})
  liveRef.current = { ...live, dim }

  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const mouse = { x: -999, y: -999, near: false, inside: false, down: false }
    let box = cv.getBoundingClientRect(), frame = 0, raf, visible = true, last = performance.now(), t = 0

    const refresh = () => { box = cv.getBoundingClientRect() }
    const map = () => {
      const x = ((pointer.x - box.left) / box.width) * w
      const y = ((pointer.y - box.top) / box.height) * h
      mouse.x = x; mouse.y = y
      mouse.inside = x >= 0 && x < w && y >= 0 && y < h
      mouse.near = pointer.active && x > -w * 0.8 && x < w * 1.8 && y > -h * 0.8 && y < h * 1.8
      mouse.down = pointer.down
    }
    const loud = () => !!(liveRef.current.lit || liveRef.current.play)
    const api = {
      ctx, w, h, mouse, live: liveRef, sfx,
      snd: (name, ...a) => { if (loud()) sfx[name]?.(...a) },
      score: (n) => store.addScore(n),
    }
    const game = make(api)

    const down = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; pointer.down = true; refresh(); map(); game.click?.() }
    cv.addEventListener('pointerdown', down)

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { refresh(); last = performance.now() } }, { threshold: 0 })
    io.observe(cv)

    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) { last = now; return }
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; t += dt
      if (frame++ % 4 === 0) refresh()
      map()
      game.tick(dt, t)
      if (liveRef.current.dim) { ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.fillRect(0, 0, w, h) }
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('resize', refresh)
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); cv.removeEventListener('pointerdown', down)
      window.removeEventListener('resize', refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={ref} width={w} height={h} className={`pixel-canvas ${className}`} style={style}
      role="img" aria-label={label || 'Animated pixel-art mini game'}
    />
  )
}
