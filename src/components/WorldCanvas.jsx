import { useEffect, useRef } from 'react'
import { rect, sprite, text, Fx, clamp, lerp } from '../lib/gfx'
import { store, bus, reducedMotion } from '../lib/store'
import { sfx } from '../lib/audio'
import { FR, PAL, OUT, ITEMS, POWER } from '../lib/sprites'

// Fixed full-viewport canvas: pastel pixel sky, parallax clouds + skyline, scrolling ground,
// the miniature-me runner and collectibles. World X is driven by page scroll.

const SKY = [['#7cc8ff', '#d7f0ff'], ['#9fb7ff', '#f0defe'], ['#8fdcff', '#e0f8ff'], ['#ffc09a', '#ffeccf'], ['#ff9fcf', '#ffe3f1'], ['#7cc8ff', '#fff4d6']]
const GROUND = [['#4cc35a', '#c8761e'], ['#2b3cff', '#0a0f3a'], ['#8a8a9c', '#3a3a48'], ['#ff9f5a', '#b4533a'], ['#ffe08a', '#c0902a'], ['#fff4d6', '#ff8cc0']]
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mixA = (a, b, t) => { const A = rgb(a), B = rgb(b); return A.map((v, i) => lerp(v, B[i], t)) }
const css = (arr) => `rgb(${arr.map(Math.round).join()})`

const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }

export default function WorldCanvas() {
  const ref = useRef(null), fgRef = useRef(null)
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d'), fcv = fgRef.current, g = fcv.getContext('2d'), FH = 22 + 52
    const reduced = reducedMotion()
    let S, W, H, raf, last = performance.now(), t = 0
    const size = () => {
      S = innerWidth < 700 ? 2 : 3
      W = Math.ceil(innerWidth / S); H = Math.ceil(innerHeight / S)
      cv.width = W; cv.height = H; cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px'
      fcv.width = W; fcv.height = FH; fcv.style.width = W * S + 'px'; fcv.style.height = FH * S + 'px'
    }
    size(); addEventListener('resize', size)

    const fx = new Fx(), got = new Set()
    const P = { y: 0, vy: 0, dir: 1 }
    let lastY = scrollY, moveT = 0, tops = [], topT = 0, curWorld = -1
    const jump = () => { if (P.y <= 0.01) { P.vy = 132; sfx.jump() } }
    const offJump = bus.on('jump', jump)
    const onClick = (e) => { if (!e.target.closest?.('a, button, input')) jump() }
    addEventListener('click', onClick)

    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; t += dt
      const sy = scrollY, vh = innerHeight
      const worldX = sy / S
      if (Math.abs(sy - lastY) > 0.5) { moveT = 0.14; P.dir = sy > lastY ? 1 : -1 } else moveT = Math.max(0, moveT - dt)
      lastY = sy

      // world detection
      topT -= dt
      if (topT <= 0) { topT = 0.8; tops = [...document.querySelectorAll('[data-world]')].map((e) => e.getBoundingClientRect().top + scrollY) }
      const mid = sy + vh * 0.45
      const T = tops.length ? tops : [0]
      let wi = 0
      T.forEach((tp, i) => { if (tp <= mid) wi = i })
      const span = (T[wi + 1] ?? T[wi] + vh) - T[wi] || 1
      const pr = clamp((mid - T[wi]) / span, 0, 1)
      const wf = clamp(wi + (wi < SKY.length - 1 ? clamp((pr - 0.78) / 0.22, 0, 1) : 0), 0, SKY.length - 1)
      if (tops.length && wi !== curWorld) { if (curWorld >= 0) bus.emit('jump'); curWorld = wi; store.set({ world: wi }) }
      const max = document.documentElement.scrollHeight - vh
      const prog = max > 0 ? clamp(sy / max, 0, 1) : 0
      store.get().progress = prog
      document.documentElement.style.setProperty('--progress', prog.toFixed(4))

      // player physics
      if (P.vy !== 0 || P.y > 0) { P.vy -= 430 * dt; P.y += P.vy * dt; if (P.y <= 0) { P.y = 0; P.vy = 0 } }
      const GH = 22, GYT = H - GH, px = Math.floor(W * 0.22)
      const lo = Math.floor(wf), hi = Math.min(SKY.length - 1, lo + 1), f = wf - lo

      // ── sky (banded) ──
      const N = 14
      const sTop = mixA(SKY[lo][0], SKY[hi][0], f), sBot = mixA(SKY[lo][1], SKY[hi][1], f)
      for (let i = 0; i < N; i++) rect(ctx, css(sTop.map((v, k) => lerp(v, sBot[k], i / (N - 1)))), 0, Math.floor((H / N) * i), W, Math.ceil(H / N) + 1)
      // clouds
      for (let i = 0; i < 9; i++) {
        const x0 = i * 83, y = 10 + ((i * 29) % 56)
        const x = ((((x0 - worldX * 0.15 - (reduced ? 0 : t * 3)) % (W + 80)) + (W + 80)) % (W + 80)) - 40
        rect(ctx, '#fff', x, y + 5, 26, 6); rect(ctx, '#fff', x + 4, y + 1, 14, 5); rect(ctx, '#fff', x + 14, y + 3, 10, 4); rect(ctx, '#e3f1ff', x, y + 9, 26, 2)
      }
      // skyline
      const sw = 15, off = worldX * 0.35
      for (let i = -1; i < W / sw + 2; i++) {
        const idx = Math.floor(off / sw) + i, x = idx * sw - off
        const bh = 22 + hash(idx) * 46, col = hash(idx + 9) > 0.5 ? '#c9b3ff' : '#ffb8e0'
        rect(ctx, col, x, GYT - bh, sw - 1, bh); rect(ctx, 'rgba(255,255,255,.28)', x, GYT - bh, sw - 1, 2)
        for (let wy = GYT - bh + 5; wy < GYT - 4; wy += 7) for (let wx = x + 2; wx < x + sw - 4; wx += 5) if (hash(idx * 7 + wy + wx) > 0.45) rect(ctx, 'rgba(255,255,255,.55)', wx, wy, 2, 3)
      }
      // ── foreground strip (ground, coins, player) lives above the page content ──
      g.setTransform(1, 0, 0, 1, 0, -(H - FH)); g.clearRect(0, H - FH, W, FH)
      // ground
      const gi = clamp(Math.round(wf), 0, 5), [gt, gb] = GROUND[gi]
      rect(g, gb, 0, GYT, W, GH); rect(g, gt, 0, GYT, W, 3); rect(g, '#0b1020', 0, GYT - 1, W, 1)
      for (let i = -1; i < W / 16 + 2; i++) {
        const x = i * 16 - (worldX % 16)
        rect(g, 'rgba(0,0,0,.18)', x, GYT + 3, 1, GH); rect(g, 'rgba(0,0,0,.18)', x, GYT + 10, 16, 1)
        if (gi === 1) rect(g, '#ffd9a0', x + 6, GYT + 6, 2, 2)
        if (gi === 2) rect(g, '#ffe34d', x + 2, GYT + 14, 8, 2)
        if (gi === 5 && i % 2) rect(g, '#fff4d6', x, GYT + 3, 16, GH)
      }

      // collectibles
      const first = Math.max(0, Math.floor((worldX - px - 200) / 90))
      for (let i = first; i < first + W / 90 + 3; i++) {
        const wx = 200 + i * 90, sx = wx - worldX + px
        if (sx < -10 || sx > W + 10 || got.has(i)) continue
        const isP = i % 9 === 4, kind = POWER[Math.floor(i / 9) % 3], hgt = isP ? 14 : 8 + (i % 3) * 7
        const y = GYT - hgt - 8 + Math.sin(t * 3 + i) * 1.2
        if (isP) sprite(g, ITEMS[kind].rows, ITEMS[kind].pal, sx - 4, y - 2)
        else { const cw = 1 + Math.abs(Math.sin(t * 5 + i)) * 4; rect(g, '#0b1020', sx - cw / 2 - 1, y - 1, cw + 2, 9); rect(g, '#ffe34d', sx - cw / 2, y, cw, 7); rect(g, '#fff', sx - cw / 2 + 1, y + 1, Math.max(1, cw / 3), 4) }
        if (Math.abs(sx - px) < 7 && hgt > P.y - 8 && hgt < P.y + 24) {
          got.add(i)
          if (isP) { store.addScore(500); fx.pop(ITEMS[kind].name + ' +500', clamp(px, 50, W - 50), y - 12, '#fff'); sfx.coin(); bus.emit('confetti', { x: px * S, y: y * S, n: 24 }) }
          else { store.addScore(50); fx.pop('+50', px, y - 8, '#ffe34d'); sfx.coin() }
        }
      }

      // player
      const moving = moveT > 0 && P.y <= 0.01
      const air = P.y > 0.01
      const frame = air ? 'a' : moving ? (Math.floor(worldX / 5) % 2 ? 'a' : 'b') : 'idle'
      const flip = P.dir < 0, py = GYT - 16 - Math.round(P.y)
      rect(g, 'rgba(0,0,0,.18)', px - 5, GYT, 10, 2)
      ;[[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => sprite(g, FR[frame], OUT, px - 5 + dx, py + dy, flip))
      sprite(g, FR[frame], PAL, px - 5, py, flip)
      fx.update(dt); fx.draw(g, 6)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('click', onClick); offJump() }
  }, [])
  return (
    <>
      <canvas ref={ref} className="world-canvas" aria-hidden="true" />
      <canvas ref={fgRef} className="world-fg" aria-hidden="true" />
    </>
  )
}
