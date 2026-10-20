// Tiny pixel-drawing toolkit. Everything is drawn in code.
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const rnd = (a, b) => a + Math.random() * (b - a)
export const pick = (arr) => arr[(Math.random() * arr.length) | 0]

export const C = {
  navy: '#0b1020', blue: '#2bb5ff', pink: '#ff3d8b', orange: '#ff9f5a',
  cream: '#fff4d6', cab: '#ff8cc0', green: '#35ff7a', yellow: '#ffe34d', red: '#ff4040',
}

export function rect(ctx, c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)) }

// rows: array of equal-length strings, pal: char -> color ('.' = transparent)
export function sprite(ctx, rows, pal, x, y, flip = false, s = 1) {
  const w = rows[0].length
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < w; i++) {
    const ch = rows[j][flip ? w - 1 - i : i]
    if (ch === '.' || !pal[ch]) continue
    ctx.fillStyle = pal[ch]
    ctx.fillRect(Math.round(x + i * s), Math.round(y + j * s), s, s)
  }
}

export function text(ctx, str, x, y, { size = 8, color = '#fff', align = 'left', shadow } = {}) {
  ctx.font = `${size}px "Press Start 2P", monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = align
  if (shadow) { ctx.fillStyle = shadow; ctx.fillText(str, Math.round(x + 1), Math.round(y + 1)) }
  ctx.fillStyle = color
  ctx.fillText(str, Math.round(x), Math.round(y))
}

// circle (optionally with a mouth wedge facing right) as sprite rows
export function circleRows(r, mouthDeg = 0) {
  const d = r * 2 + 1, rows = []
  for (let j = 0; j < d; j++) {
    let row = ''
    for (let i = 0; i < d; i++) {
      const dx = i - r, dy = j - r
      let on = dx * dx + dy * dy <= r * r + 0.5
      if (on && mouthDeg) {
        const a = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI)
        if (a < mouthDeg / 2 && dx > 0) on = false
      }
      row += on ? 'y' : '.'
    }
    rows.push(row)
  }
  return rows
}

export const GHOST = [
  '...ggggg...', '.ggggggggg.', 'ggggggggggg', 'gwwgggwwggg', 'gwbgggwbggg', 'ggggggggggg',
  'ggggggggggg', 'ggggggggggg', 'ggggggggggg', 'gg.ggggg.gg', 'g...ggg...g',
]
export const ghostPal = (g, eye = '#2b4bff') => ({ g, w: '#fff', b: eye })

// floating text + particle confetti for any canvas
export class Fx {
  constructor() { this.pops = []; this.bits = [] }
  pop(str, x, y, color = '#fff') { this.pops.push({ str, x, y, c: color, life: 1 }) }
  burst(x, y, colors = [C.pink, C.blue, C.yellow, C.green], n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = rnd(10, 40)
      this.bits.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 12, c: pick(colors), life: rnd(0.5, 1) })
    }
  }
  update(dt) {
    this.pops.forEach((p) => { p.y -= 14 * dt; p.life -= dt * 0.9 })
    this.bits.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 90 * dt; b.life -= dt })
    this.pops = this.pops.filter((p) => p.life > 0)
    this.bits = this.bits.filter((b) => b.life > 0)
  }
  draw(ctx, size = 6) {
    this.bits.forEach((b) => rect(ctx, b.c, b.x, b.y, 2, 2))
    this.pops.forEach((p) => text(ctx, p.str, p.x, p.y, { size, color: p.c, align: 'center', shadow: '#000' }))
  }
}

// make pixel cursors as CSS custom properties
export function installCursors() {
  const mk = (fill) => {
    const rows = [
      'k...........', 'kk..........', 'kfk.........', 'kffk........', 'kfffk.......', 'kffffk......',
      'kfffffk.....', 'kffffffk....', 'kfffffffk...', 'kfffffkkkk..', 'kffkffk.....', 'kfk.kffk....',
      'kk...kffk...', 'k....kffk...', '......kk....',
    ]
    const s = 2, cv = document.createElement('canvas')
    cv.width = 12 * s; cv.height = rows.length * s
    const g = cv.getContext('2d')
    sprite(g, rows, { k: '#0b1020', f: fill }, 0, 0, false, s)
    return `url(${cv.toDataURL()}) 0 0, auto`
  }
  const root = document.documentElement
  root.style.setProperty('--cur', mk('#fff4d6'))
  root.style.setProperty('--cur-hot', mk('#ff8cc0'))
}
