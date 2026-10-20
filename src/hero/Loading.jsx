import { useEffect, useRef } from 'react'
import PixelCanvas from '../components/PixelCanvas'
import { rect, sprite, text, Fx, C, circleRows, GHOST, ghostPal, lerp } from '../lib/gfx'
import { sfx } from '../lib/audio'
import { reducedMotion } from '../lib/store'

// piecewise-linear keyframes: [[t, value], ...]
const KF = (a, t) => {
  if (t <= a[0][0]) return a[0][1]
  for (let i = 1; i < a.length; i++) if (t <= a[i][0]) return lerp(a[i - 1][1], a[i][1], (t - a[i - 1][0]) / (a[i][0] - a[i - 1][0]))
  return a[a.length - 1][1]
}
const PAC = [[0, 10], [1.3, 200], [2.0, 140], [3.0, 110], [3.45, 100]]
const GH = [
  [[0, -30], [1.3, 160], [2.0, 140]],
  [[0, -52], [1.3, 138], [2.0, 106], [3.0, 60], [3.4, 100]],
  [[0, -74], [1.3, 116], [2.0, 84], [3.0, 38], [3.4, 78]],
  [[0, -96], [1.3, 94], [2.0, 62], [3.0, 16], [3.4, 56]],
]
const PROG = [[0, 0], [1.3, 45], [2.6, 70], [3.4, 90], [5.1, 90], [5.2, 100]]
const COLS = ['#ff4040', '#ff8cc0', '#2bd9ff', '#ff9f5a']
const THUMB = ['...tt..', '...tt..', '..ttt..', 'tttttt.', 'ttttttt', 'ttttttt', 'tttttt.', '.tttt..']
const mouths = [0, 40, 80, 40].map((m) => circleRows(6, m))
const DEATH_END = 5.6

function scene(api) {
  const { ctx, w, h } = api
  const fx = new Fx()
  const flags = {}
  const once = (k, fn) => { if (!flags[k]) { flags[k] = 1; fn() } }
  const GY = 126
  return {
    tick(dt, t) {
      fx.update(dt)
      const pac = KF(PAC, t)
      const p = KF(PROG, t)
      rect(ctx, '#000', 0, 0, w, h)
      // title
      const dead = t >= 3.4, countdown = t >= 4.4
      const title = !dead ? 'LOADING...' : 'GAME OVER...'
      text(ctx, title, w / 2, 30, { size: 12, color: dead ? C.red : C.cream, align: 'center', shadow: dead ? '#600' : '#444' })
      if (countdown && t < 5.1) {
        const n = Math.max(1, 3 - Math.floor((t - 4.4) / 0.24))
        text(ctx, 'CONTINUE?', w / 2 - 36, 46, { size: 8, color: C.orange })
        text(ctx, '3', w / 2 + 40, 46, { size: 8, color: n === 3 ? '#fff' : '#555' }); text(ctx, '·', w / 2 + 52, 46, { size: 8, color: '#777' })
        text(ctx, '2', w / 2 + 62, 46, { size: 8, color: n === 2 ? '#fff' : '#555' }); text(ctx, '·', w / 2 + 74, 46, { size: 8, color: '#777' })
        text(ctx, '1', w / 2 + 84, 46, { size: 8, color: n === 1 ? '#fff' : '#555' })
      } else if (t >= 5.1) text(ctx, 'CONTINUE!', w / 2, 46, { size: 8, color: C.green, align: 'center' })
      // progress bar (20 chunky segments)
      rect(ctx, '#fff', 38, 62, 244, 18); rect(ctx, '#000', 40, 64, 240, 14)
      const seg = Math.floor(p / 5)
      for (let i = 0; i < seg; i++) rect(ctx, i < 14 ? C.blue : i < 18 ? C.pink : C.orange, 42 + i * 12, 66, 10, 10)
      text(ctx, Math.floor(p) + '%', w / 2, 86, { size: 8, color: '#fff', align: 'center' })
      // corridor
      rect(ctx, '#2b3cff', 0, 108, w, 2); rect(ctx, '#2b3cff', 0, 144, w, 2); rect(ctx, '#2b3cff', 0, 112, w, 1); rect(ctx, '#2b3cff', 0, 141, w, 1)
      // pellets
      const maxPac = KF(PAC, Math.min(t, 1.3))
      for (let x = 14; x < w; x += 16) if (x > maxPac && Math.abs(x - 200) > 4) rect(ctx, '#ffd9a0', x, GY - 1, 3, 3)
      if (t < 1.3 && Math.floor(t * 6) % 2 === 0) rect(ctx, '#ffd9a0', 197, GY - 3, 7, 7)
      else if (t < 1.3) rect(ctx, '#ffd9a0', 198, GY - 2, 5, 5)
      if (t >= 1.3) once('pwr', () => sfx.beep(260))

      const scared = t >= 1.3 && t < 3.0
      const flash = t >= 2.6 && t < 3.0 && Math.floor(t * 10) % 2 === 0
      if (t < 3.5) GH.forEach((k, i) => {
        if (i === 0 && t >= 2.0) { if (t < 2.7) { once('eat', () => { sfx.eat(); fx.pop('200', 140, GY - 20, '#2bd9ff') }) } ; return }
        const gx = KF(k, t)
        const pal = scared ? (flash ? { g: '#fff', w: '#f33', b: '#f33' } : { g: '#2b2bff', w: '#ffe', b: '#ffe' }) : ghostPal(COLS[i])
        sprite(ctx, GHOST, pal, gx - 5, GY - 6)
      })
      // pac-man
      if (t < 3.4) {
        const flip = t >= 1.3
        const rows = mouths[Math.floor(t * 12) % 4]
        sprite(ctx, rows, { y: '#ffe34d' }, pac - 6, GY - 6, flip)
      } else if (t < 4.4) {
        once('death', () => sfx.death())
        const f = (t - 3.4) / 0.9
        if (f < 1) {
          // fold in on himself (mouth opens upwards until nothing is left)
          ctx.fillStyle = '#ffe34d'
          const R = 6
          for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
            if (i * i + j * j > R * R + 0.5) continue
            const a = Math.atan2(i, -j) // 0 at top, +/- π at bottom
            if (Math.abs(a) < f * Math.PI - 0.05 + 0) continue // wedge removed
            ctx.fillRect(Math.round(pac + i), GY + j, 1, 1)
          }
        } else once('pop', () => fx.burst(pac, GY, ['#ffe34d', '#fff'], 14))
      }
      // coin + revive
      if (t >= 5.1) {
        once('coin', () => sfx.coin())
        const cy = Math.min(70, (t - 5.1) * 500)
        if (t < 5.3) { rect(ctx, '#ffe34d', w / 2 - 3, cy - 6, 7, 9); rect(ctx, '#fff', w / 2 - 1, cy - 4, 2, 5) }
        const rx = 160, blink = t > 5.3 && Math.floor(t * 8) % 5 === 0
        sprite(ctx, mouths[blink ? 0 : 1], { y: '#ffe34d' }, rx - 6, GY - 6)
        rect(ctx, '#000', rx + 1, GY - 4, 2, 2)
        sprite(ctx, THUMB, { t: '#ffd36b' }, rx + 9, GY - 12 - Math.round(Math.sin(t * 12)))
      }
      fx.draw(ctx, 8)
      // CRT
      for (let y = 0; y < h; y += 2) rect(ctx, 'rgba(0,0,0,.2)', 0, y, w, 1)
      if (t > DEATH_END && !flags.done) { flags.done = 1; api.live.current.onDone?.() }
    },
  }
}

export default function Loading({ onDone, onSkip }) {
  const reduced = reducedMotion()
  const done = useRef(onDone); done.current = onDone
  useEffect(() => {
    if (!reduced) return
    const id = setTimeout(() => done.current(), 1300)
    return () => clearTimeout(id)
  }, [reduced])

  return (
    <div className="loading" role="status" aria-live="polite" aria-label="Loading the portfolio">
      {reduced ? (
        <div className="loading-simple">
          <p className="font-pixel text-cream">LOADING...</p>
          <div className="lbar"><i /></div>
        </div>
      ) : (
        <PixelCanvas w={320} h={180} make={scene} onDone={onDone} className="loading-canvas" label="Loading screen: Pac-Man eats a power pellet, loses, and continues" />
      )}
      <button className="pix-btn small skip" onClick={onSkip}>SKIP &gt;</button>
    </div>
  )
}
