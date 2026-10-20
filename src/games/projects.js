import { rect, sprite, text, Fx, C, clamp, lerp, rnd, pick } from '../lib/gfx'
import { store } from '../lib/store'
import { drawCar, tetris } from './hero'

/* Project scenes — 192 x 108. `live.current.play` is true after the visitor pressed START. */
const W = 192, H = 108
const banner = (ctx, str, y, bg, fg = '#fff') => { rect(ctx, bg, 0, y, W, 12); text(ctx, str, W / 2, y + 2, { size: 8, color: fg, align: 'center' }) }

// 1 ─ BLE road safety (top-down, horizontal road)
export function bleScene(api) {
  const { ctx, mouse } = api
  const fx = new Fx()
  const A = { x: -10, lane: 0, v: 34, boost: 0 }, B = { x: -60, lane: 0, v: 55, y: 54, avoided: 0 }
  const rings = []
  let ringT = 0, off = 0
  const laneY = [52, 70]
  A.y = laneY[0]; B.y = laneY[0]
  return {
    click() { if (api.live.current.play) { A.boost = 1.6; fx.pop('VROOM!', A.x, A.y - 10, C.yellow); api.snd('beep', 300) } },
    tick(dt, t) {
      A.boost = Math.max(0, A.boost - dt); ringT -= dt
      if (ringT <= 0) { ringT = 1.1; rings.push(0) }
      for (let i = rings.length - 1; i >= 0; i--) { rings[i] += 46 * dt; if (rings[i] > 64) rings.splice(i, 1) }
      const inZone = A.x > 92 && A.x < 150
      const tv = A.boost > 0 ? 78 : inZone ? 16 : A.x > 40 && A.x < 92 ? 22 : 36
      A.v += clamp(tv - A.v, -60 * dt, 60 * dt)
      off += 40 * dt
      A.x += A.v * dt
      // car B approaches from behind, swerves around
      const gap = A.x - B.x
      const sameLane = Math.abs(B.y - A.y) < 8
      let btv = 55
      if (sameLane && gap > 0 && gap < 34) { B.avoided = 1.2; B.lane = 1 }
      if (B.x > A.x + 18) B.lane = 0
      B.y += clamp(laneY[B.lane] - B.y, -40 * dt, 40 * dt)
      B.avoided = Math.max(0, B.avoided - dt)
      B.x += btv * dt
      if (A.x > W + 14) { A.x = -10; A.boost = 0 }
      if (B.x > W + 14) { B.x = A.x - 70; B.lane = 0; B.y = laneY[0] }
      fx.update(dt)

      rect(ctx, '#5fcf6b', 0, 0, W, H)
      for (let i = 0; i < 6; i++) rect(ctx, '#46b955', (i * 37 + 5) % W, (i * 23) % 30 + 4, 8, 6)
      rect(ctx, '#3a3a48', 0, 40, W, 46); rect(ctx, '#fff', 0, 40, W, 2); rect(ctx, '#fff', 0, 84, W, 2)
      for (let i = -1; i < W / 16 + 1; i++) rect(ctx, '#ffe34d', i * 16 - (off % 16), 61, 8, 2)
      // danger zone stripes
      for (let i = 0; i < 12; i++) rect(ctx, i % 2 ? '#ff9f5a' : '#222', 92 + i * 5, 42, 4, 42)
      // beacon
      rect(ctx, '#666', 120, 24, 2, 16); rect(ctx, '#2bb5ff', 118, 20, 6, 5)
      if (Math.floor(t * 4) % 2) rect(ctx, '#fff', 120, 21, 2, 2)
      rings.forEach((r) => { const a = Math.max(0, 1 - r / 64); for (let k = 0; k < 28; k++) { const an = (k / 28) * 6.283; rect(ctx, `rgba(43,181,255,${a})`, 121 + Math.cos(an) * r, 22 + Math.sin(an) * r * 0.7, 2, 2) } })
      ctx.save(); ctx.translate(Math.round(B.x), Math.round(B.y)); ctx.rotate(Math.PI / 2); drawCar(ctx, 0, 0, '#ff4040'); ctx.restore()
      ctx.save(); ctx.translate(Math.round(A.x), Math.round(A.y)); ctx.rotate(Math.PI / 2); drawCar(ctx, 0, 0, '#2bb5ff'); ctx.restore()
      fx.draw(ctx, 6)
      if (A.boost > 0 || A.v > 55) { if (Math.floor(t * 6) % 2) banner(ctx, 'SPEEDING ALERT', 0, '#ff4040') }
      else if (A.x > 60 && A.x < 150) { if (Math.floor(t * 4) % 2) banner(ctx, 'DANGER ZONE AHEAD!', 0, '#ff9f5a', '#000') }
      else if (B.avoided > 0) banner(ctx, 'CRASH AVOIDED!', 0, '#35ff7a', '#000')
      else banner(ctx, 'BLE BEACON ONLINE', 0, '#223')
    },
  }
}

// 2 ─ Pothole runner
const RUN = ['.hhhh.', '.ssss.', '.wwww.', 'swwwws', '.wwww.', '.bbbb.']
export function potholeScene(api) {
  const { ctx, mouse } = api
  const fx = new Fx(), holes = []
  const GY = 86
  const me = { y: GY, vy: 0 }
  let sp = 0.6, off = 0, warn = null
  const RISK = [['LOW', '#35ff7a'], ['MEDIUM', '#ffe34d'], ['HIGH', '#ff4040']]
  return {
    click() {
      if (!api.live.current.play) return
      holes.forEach((p) => {
        if (!p.rep && Math.abs(mouse.x - p.x) < 14 && Math.abs(mouse.y - GY - 4) < 14) { p.rep = true; fx.pop('REPORTED +100', clamp(p.x, 46, W - 46), GY - 24, C.yellow); fx.burst(p.x, GY, [C.green, C.yellow], 8); api.score(100); api.snd('coin') }
      })
    },
    tick(dt, t) {
      sp -= dt; off += 50 * dt
      if (sp <= 0) { sp = rnd(1.2, 2); holes.push({ x: W + 10, r: (Math.random() * 3) | 0, rep: false }) }
      holes.forEach((p) => (p.x -= 50 * dt))
      while (holes[0] && holes[0].x < -14) holes.shift()
      const nxt = holes.find((p) => p.x > 26 && p.x < 110)
      warn = nxt ? RISK[nxt.r] : null
      if (holes.some((p) => p.x > 30 && p.x < 44) && me.y >= GY) me.vy = -120
      me.vy += 330 * dt; me.y += me.vy * dt; if (me.y >= GY) { me.y = GY; me.vy = 0 }
      fx.update(dt)

      rect(ctx, '#bfe9ff', 0, 0, W, H)
      for (let i = 0; i < 8; i++) { const bx = ((i * 31 - off * 0.2) % 220 + 220) % 220 - 20; rect(ctx, '#a9c4ff', bx, GY - 24 - (i % 3) * 8, 14, 24 + (i % 3) * 8) }
      rect(ctx, '#4a4a5a', 0, GY, W, H - GY); rect(ctx, '#fff', 0, GY, W, 1)
      for (let i = -1; i < W / 20 + 1; i++) rect(ctx, '#ffe34d', i * 20 - (off % 20), GY + 10, 10, 2)
      holes.forEach((p) => {
        const c = RISK[p.r][1]
        rect(ctx, '#111', p.x - 7, GY + 2, 14, 5); rect(ctx, '#222', p.x - 5, GY + 1, 10, 1)
        rect(ctx, p.rep ? '#fff' : c, p.x - 8, GY + 1, 2, 6); rect(ctx, p.rep ? '#fff' : c, p.x + 6, GY + 1, 2, 6)
        if (p.rep) text(ctx, '✓', p.x - 3, GY + 8, { size: 6, color: '#35ff7a' })
      })
      const y = Math.round(me.y) - 13, f = Math.floor(off / 5) % 2
      sprite(ctx, RUN, { h: '#111', s: '#f2c29b', w: '#fff', b: '#2b6cff' }, 30, y)
      rect(ctx, '#2b6cff', f ? 31 : 30, y + 6, 2, 3); rect(ctx, '#2b6cff', f ? 34 : 35, y + 6, 2, 3); rect(ctx, '#222', f ? 31 : 30, y + 9, 2, 1); rect(ctx, '#222', f ? 34 : 35, y + 9, 2, 1)
      fx.draw(ctx, 6)
      if (warn && Math.floor(t * 5) % 3) banner(ctx, `POTHOLE: ${warn[0]} RISK`, 0, warn[1], '#000')
      else banner(ctx, 'SCANNING ROAD...', 0, '#223')
    },
  }
}

// 3 ─ AI healthcare invaders
const CASES = [['FEVER', 'FLU', 'REST'], ['COUGH', 'COLD', 'TEA'], ['ACHE', 'STRAIN', 'ICE'], ['RASH', 'ALLERGY', 'CREAM']]
const GERM = ['..g..g..', '.gggggg.', 'gwgggwgg', 'gwgggwgg', 'gggggggg', '.g.gg.g.']
export function healthScene(api) {
  const { ctx, mouse } = api
  const fx = new Fx(), bl = []
  let germs = [], ox = 8, dir = 1, oy = 18, ship = 90, cool = 0.4, ci = 0, bubble = CASES[0], bt = 0, respawn = 0
  const reset = () => { germs = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) germs.push({ c, r, alive: true }); oy = 18; ox = 8 }
  reset()
  const shoot = (user) => { const cs = CASES[ci++ % CASES.length]; bl.push({ x: ship, y: 90, y0: 90, cs, user }); bubble = cs; bt = 1.4; api.snd('shoot') }
  return {
    click() { if (api.live.current.play) { shoot(true); cool = 0.8 } },
    tick(dt, t) {
      const tx = api.live.current.play && mouse.near ? clamp(mouse.x, 10, 120) : 62 + Math.sin(t * 0.9) * 48
      ship += clamp(tx - ship, -50 * dt, 50 * dt)
      cool -= dt; bt -= dt
      if (cool <= 0) { shoot(false); cool = 1.1 }
      ox += dir * 7 * dt; if (ox > 58 || ox < 2) { dir *= -1; oy += 3 }
      if (oy > 56) reset()
      bl.forEach((b) => {
        b.y -= 70 * dt
        germs.forEach((g) => {
          const x = ox + g.c * 17, y = oy + g.r * 11
          if (g.alive && !b.gone && b.x > x - 2 && b.x < x + 10 && b.y > y && b.y < y + 9) {
            g.alive = false; b.gone = true; fx.burst(x + 4, y + 4, ['#35ff7a', '#fff', '#ffe34d'], 12); fx.pop(b.cs[2], clamp(x + 4, 20, 110), y - 2, '#fff')
            if (b.user) api.score(100); api.snd('pop')
          }
        })
      })
      for (let i = bl.length - 1; i >= 0; i--) if (bl[i].gone || bl[i].y < -6) bl.splice(i, 1)
      if (!germs.some((g) => g.alive)) { respawn += dt; if (respawn > 0.8) { respawn = 0; reset() } }
      fx.update(dt)

      rect(ctx, '#14143a', 0, 0, W, H)
      for (let i = 0; i < 22; i++) if (Math.sin(t * 2 + i) > -0.4) rect(ctx, '#7a8cff', (i * 53) % 130, (i * 29) % H, 1, 1)
      germs.forEach((g) => { if (g.alive) sprite(ctx, GERM, { g: '#7aff5a', w: '#fff' }, ox + g.c * 17, oy + g.r * 11 + (Math.floor(t * 2) % 2)) })
      // doctor ship
      rect(ctx, '#fff', ship - 6, 96, 13, 6); rect(ctx, '#ff3d8b', ship - 1, 92, 3, 8); rect(ctx, '#ff3d8b', ship - 4, 95, 9, 2); rect(ctx, '#2bb5ff', ship - 6, 102, 13, 2)
      bl.forEach((b) => {
        const f = clamp((b.y0 - b.y) / (b.y0 - 24), 0, 1), s = b.cs[f < 0.33 ? 0 : f < 0.66 ? 1 : 2]
        rect(ctx, '#ffe34d', b.x - 1, b.y, 3, 5); text(ctx, s, b.x, b.y - 9, { size: 6, color: '#ffe34d', align: 'center', shadow: '#000' })
      })
      // chat bubble
      rect(ctx, '#fff4d6', 134, 8, 54, 38); rect(ctx, '#0b1020', 134, 8, 54, 2); rect(ctx, '#0b1020', 134, 44, 54, 2); rect(ctx, '#0b1020', 134, 8, 2, 38); rect(ctx, '#0b1020', 186, 8, 2, 38); rect(ctx, '#fff4d6', 140, 46, 6, 5)
      text(ctx, 'BOT', 140, 12, { size: 6, color: '#ff3d8b' })
      text(ctx, bubble[0], 140, 22, { size: 6, color: '#0b1020' }); text(ctx, '= ' + bubble[1], 140, 32, { size: 6, color: '#0b1020' })
      fx.draw(ctx, 6)
      text(ctx, 'SYMPTOM>DIAGNOSIS>REMEDY', 4, 2, { size: 6, color: '#7a8cff' })
    },
  }
}

// 4 ─ EduLib: tetris with book shelves + status flips
export const eduScene = tetris({ cell: 6, ox: 10, rows: 18, books: true })

// 5 ─ Portfolio meta monitor: YOU ARE HERE
export function monitorScene(api) {
  const { ctx } = api
  const fx = new Fx(), rings = []
  const nodes = [['1-1', '#7cc8ff'], ['1-2', '#c9b3ff'], ['2', '#8fdcff'], ['3', '#ffc9a0'], ['4', '#ff9fd0'], ['5', '#fff4d6']]
  return {
    click() { if (api.live.current.play) { rings.push(0); fx.pop('PING!', 96, 40, C.green); api.snd('beep', 760) } },
    tick(dt, t) {
      const prog = store.get().progress
      for (let i = rings.length - 1; i >= 0; i--) { rings[i] += 70 * dt; if (rings[i] > 70) rings.splice(i, 1) }
      fx.update(dt)
      rect(ctx, '#bfe9ff', 0, 0, W, H)
      for (let i = 0; i < 12; i++) rect(ctx, '#d9f3ff', (i * 61) % W, (i * 17) % 40, 12, 4)
      rect(ctx, '#c9b3ff', 0, 84, W, 24)
      // monitor
      rect(ctx, '#d8cdb8', 26, 8, 140, 78); rect(ctx, '#0b1020', 26, 8, 140, 2); rect(ctx, '#0b1020', 26, 84, 140, 2); rect(ctx, '#0b1020', 26, 8, 2, 78); rect(ctx, '#0b1020', 164, 8, 2, 78)
      rect(ctx, '#0e1b4a', 34, 16, 124, 54)
      for (let y = 16; y < 70; y += 2) rect(ctx, 'rgba(0,0,0,.2)', 34, y, 124, 1)
      rect(ctx, '#d8cdb8', 80, 86, 32, 6); rect(ctx, '#bdb29c', 66, 92, 60, 5)
      if (Math.floor(t * 2.5) % 2) text(ctx, 'YOU ARE HERE', 96, 22, { size: 8, color: C.green, align: 'center' })
      // level path
      rect(ctx, '#4a5aa0', 44, 52, 104, 2)
      nodes.forEach(([n, c], i) => { const x = 44 + (i / 5) * 104; rect(ctx, c, x - 3, 49, 6, 8); text(ctx, n, x, 59, { size: 6, color: '#9fb4ff', align: 'center' }) })
      const px = 44 + clamp(prog, 0, 1) * 104
      rect(ctx, '#fff', px - 2, 38 + Math.sin(t * 6) * 2, 5, 5); rect(ctx, '#ff3d8b', px - 1, 43 + Math.sin(t * 6) * 2, 3, 3); rect(ctx, '#ff3d8b', px, 46, 1, 3)
      rings.forEach((r) => { for (let k = 0; k < 24; k++) { const a = (k / 24) * 6.283; rect(ctx, '#35ff7a', px + Math.cos(a) * r * 0.9, 51 + Math.sin(a) * r * 0.4, 2, 2) } })
      fx.draw(ctx, 6)
    },
  }
}

export const scenes = { racing: bleScene, runner: potholeScene, invaders: healthScene, tetris: eduScene, monitor: monitorScene }
export const SCENE_SIZE = { w: W, h: H }
