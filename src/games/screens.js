import { rect, sprite, text, C, lerp, GHOST, ghostPal } from '../lib/gfx'

// The big CONTINUE? screen on the centre cabinet (192 x 144)
export function continueScreen(api) {
  const { ctx, w, h, mouse } = api
  const L = api.live
  const regions = [{ x: 50, y: 52, w: 52, h: 18 }, { x: 106, y: 52, w: 36, h: 18 }]
  let hover = -1
  const line = (x0, y0, x1, y1, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) rect(ctx, c, lerp(x0, x1, i / n), lerp(y0, y1, i / n), 1, 1) }
  const calc = () => {
    const s = L.current
    let hv = -1
    if (mouse.inside && s.mode === 'menu') regions.forEach((r, i) => { if (mouse.x >= r.x && mouse.x <= r.x + r.w && mouse.y >= r.y && mouse.y <= r.y + r.h) hv = i })
    if (hv !== hover) { hover = hv; if (hv >= 0) s.onHover?.(hv) }
  }
  return {
    click() { calc(); if (hover >= 0) L.current.onChoose?.(hover) },
    tick(dt, t) {
      const s = L.current
      calc()

      rect(ctx, '#000', 0, 0, w, h)
      // glow of the grid
      const hz = 84
      for (let i = -9; i <= 9; i++) line(w / 2 + i * 2, hz, w / 2 + i * 22, h, 'rgba(53,255,122,.75)')
      for (let k = 0; k < 8; k++) { const y = hz + Math.pow(((k + ((t * 0.7) % 1)) / 8), 2) * (h - hz); rect(ctx, 'rgba(53,255,122,.8)', 0, y, w, 1) }
      rect(ctx, '#000', 0, hz - 2, w, 2)
      // floating ghost
      const gy = 84 + Math.sin(t * 2.2) * 5
      sprite(ctx, GHOST, ghostPal('#ff8cc0'), 138, gy - 12, false, 1)
      sprite(ctx, GHOST, ghostPal('#2bd9ff'), 30, gy - 4, false, 1)

      if (s.mode === 'no') {
        text(ctx, 'GAME OVER...', w / 2, 14, { size: 14, color: C.red, align: 'center', shadow: '#600' })
        text(ctx, 'just kidding,', w / 2, 40, { size: 8, color: C.cream, align: 'center' })
        text(ctx, 'come on in!', w / 2, 54, { size: 8, color: C.cream, align: 'center' })
        text(ctx, String(s.count ?? ''), w / 2, 78, { size: 28, color: C.orange, align: 'center', shadow: '#7a3000' })
      } else {
        // CONTINUE? (italic)
        ctx.save()
        ctx.transform(1, 0, -0.24, 1, 0, 0)
        text(ctx, 'CONTINUE?', w / 2 + 0.24 * 26, 14, { size: 16, color: '#fff', align: 'center', shadow: C.pink })
        ctx.restore()
        const flash = s.coined && Math.floor(t * 6) % 2 === 0
        const names = ['YES', 'NO']
        regions.forEach((r, i) => {
          const on = s.sel === i
          const col = flash ? C.orange : on ? C.cream : '#8a8aa8'
          if (on) { rect(ctx, 'rgba(255,255,255,.1)', r.x - 2, r.y - 2, r.w + 4, r.h + 4); if (Math.floor(t * 3) % 2 === 0) text(ctx, '>', r.x, r.y + 3, { size: 10, color: C.pink }) }
          text(ctx, names[i], r.x + 14, r.y + 3, { size: 10, color: col })
        })
        text(ctx, s.coined ? 'CREDIT 1 · PRESS START' : 'INSERT COIN', w / 2, 34, { size: 6, color: s.coined ? C.green : '#ff9f5a', align: 'center' })
      }
      // CRT lines
      for (let y = 0; y < h; y += 2) rect(ctx, 'rgba(0,0,0,.22)', 0, y, w, 1)
    },
  }
}
