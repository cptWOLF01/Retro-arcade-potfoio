import { useEffect, useRef } from 'react'
import { pointer } from '../lib/pointer'
import { rnd, pick } from '../lib/gfx'

// 2D pixel motes that drift away from the cursor
export default function Dust() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d'), S = 4
    let W, H, raf, last = performance.now()
    const size = () => { W = Math.ceil(innerWidth / S); H = Math.ceil(innerHeight / S); cv.width = W; cv.height = H; cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px' }
    size(); addEventListener('resize', size)
    const P = Array.from({ length: 70 }, () => ({ x: rnd(0, 400), y: rnd(0, 250), vx: rnd(-2, 2), vy: rnd(-5, -1), c: pick(['#fff4d6', '#2bb5ff', '#ff8cc0', '#ff9f5a']), s: Math.random() < 0.2 ? 2 : 1 }))
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now
      ctx.clearRect(0, 0, W, H)
      const mx = pointer.x / S, my = pointer.y / S
      P.forEach((p) => {
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy)
        if (d < 28 && d > 0.1) { p.vx += (dx / d) * 120 * dt; p.vy += (dy / d) * 120 * dt }
        p.vx *= 0.97; p.vy = p.vy * 0.97 + -1.2 * dt
        p.x += p.vx * dt * 6; p.y += p.vy * dt * 6
        if (p.y < -2) { p.y = H + 2; p.x = rnd(0, W) }
        if (p.x < -2) p.x = W + 2; if (p.x > W + 2) p.x = -2
        ctx.fillStyle = p.c; ctx.fillRect(p.x | 0, p.y | 0, p.s, p.s)
      })
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size) }
  }, [])
  return <canvas ref={ref} className="dust" aria-hidden="true" />
}
