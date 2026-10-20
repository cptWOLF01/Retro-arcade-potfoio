import { useEffect, useRef } from 'react'
import { bus } from '../lib/store'
import { rnd, pick } from '../lib/gfx'

// Global pixel-confetti layer. Fire with bus.emit('confetti', { x, y, n })
export default function Confetti() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d'), S = 4
    let W, H, bits = [], raf = 0, last = 0
    const size = () => { W = Math.ceil(innerWidth / S); H = Math.ceil(innerHeight / S); cv.width = W; cv.height = H; cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px' }
    size(); addEventListener('resize', size)
    const loop = (now) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now
      ctx.clearRect(0, 0, W, H)
      bits.forEach((b) => { b.vy += 120 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; ctx.fillStyle = b.c; ctx.fillRect(b.x | 0, b.y | 0, b.s, b.s) })
      bits = bits.filter((b) => b.life > 0 && b.y < H + 4)
      raf = bits.length ? requestAnimationFrame(loop) : 0
    }
    const off = bus.on('confetti', ({ x, y, n = 80 }) => {
      for (let i = 0; i < n; i++) { const a = rnd(-Math.PI, 0), s = rnd(30, 110); bits.push({ x: x / S, y: y / S, vx: Math.cos(a) * s, vy: Math.sin(a) * s, c: pick(['#ff3d8b', '#2bb5ff', '#ffe34d', '#35ff7a', '#ff9f5a', '#fff4d6']), s: Math.random() < 0.3 ? 2 : 1, life: rnd(1.4, 2.6) }) }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop) }
    })
    return () => { off(); removeEventListener('resize', size); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={ref} className="confetti" aria-hidden="true" />
}
