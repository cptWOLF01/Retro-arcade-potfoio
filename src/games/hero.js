import { rect, sprite, text, Fx, C, clamp, lerp, rnd, pick, circleRows } from '../lib/gfx'

/* Every game: (api) => ({ tick(dt,t), click() }).  Pointer logic: mouse.near / mouse.x / mouse.y in canvas px. */

// ───────────────────────── CONTRA / BUG STAGE ─────────────────────────
const BUG = ['..gg..', '.gggg.', 'gwggwg', '.gggg.', 'g.gg.g']
export function contra({ bugs = false } = {}) {
  return (api) => {
    const { ctx, w, h, mouse } = api
    const fx = new Fx(), en = [], bl = []
    const GY = h - 10
    const hero = { x: w / 2, dir: 1, run: 0, cool: 0.5 }
    let spawn = 0.6, aimAng = 0
    const tree = Array.from({ length: Math.ceil(w / 9) + 2 }, (_, i) => ({ x: i * 9, h: 14 + ((i * 37) % 14) }))

    const fire = (ang, user) => {
      bl.push({ x: hero.x + Math.cos(ang) * 5, y: GY - 8 + Math.sin(ang) * 5, vx: Math.cos(ang) * 120, vy: Math.sin(ang) * 120, user })
      api.snd('shoot')
    }
    const nearest = () => en.reduce((b, e) => (e.rise <= 0.2 && (!b || Math.abs(e.x - hero.x) < Math.abs(b.x - hero.x)) ? e : b), null)

    return {
      click() {
        if (!api.live.current.lit && !api.live.current.play) return
        fire(aimAng, true); hero.cool = 0.35
      },
      tick(dt, t) {
        spawn -= dt
        if (spawn <= 0) {
          spawn = rnd(1, 2)
          if (bugs) { const l = Math.random() < 0.5; en.push({ x: l ? -6 : w + 6, y: GY, vx: (l ? 1 : -1) * rnd(10, 18), rise: 0 }) }
          else en.push({ x: rnd(8, w - 8), y: GY, vx: 0, rise: 1 })
        }
        // hero movement toward cursor (or patrol)
        const tx = mouse.near ? clamp(mouse.x, 6, w - 6) : w / 2 + Math.sin(t * 0.6) * w * 0.3
        const dx = tx - hero.x
        if (Math.abs(dx) > 3) { hero.x += Math.sign(dx) * 26 * dt; hero.dir = Math.sign(dx); hero.run += dt * 10 }
        const tgt = nearest()
        aimAng = mouse.near ? Math.atan2(mouse.y - (GY - 8), mouse.x - hero.x) : tgt ? Math.atan2(tgt.y - 4 - (GY - 8), tgt.x - hero.x) : hero.dir > 0 ? 0 : Math.PI
        hero.cool -= dt
        if (hero.cool <= 0 && tgt && Math.abs(tgt.x - hero.x) < w * 0.7) { fire(Math.atan2(tgt.y - 4 - (GY - 8), tgt.x - hero.x), false); hero.cool = 0.75 }

        en.forEach((e) => { e.rise = Math.max(0, e.rise - dt * 2.5); e.x += e.vx * dt })
        bl.forEach((b) => {
          b.x += b.vx * dt; b.y += b.vy * dt
          en.forEach((e) => {
            if (!e.dead && Math.abs(b.x - e.x) < 5 && Math.abs(b.y - (e.y - 4 + e.rise * 8)) < 6) {
              e.dead = true; b.gone = true
              fx.burst(e.x, e.y - 4, bugs ? [C.green, C.yellow, '#fff'] : [C.orange, C.yellow, C.red], 10)
              fx.pop(bugs ? 'BUG FIXED! +100' : '+100', clamp(e.x, 30, w - 30), e.y - 14, C.yellow)
              if (b.user) api.score(100)
              api.snd('pop')
            }
          })
        })
        en.forEach((e) => { if (!e.dead && Math.abs(e.x - hero.x) < 4) { e.dead = true; fx.burst(e.x, e.y - 4, [C.green, '#fff'], 8) } })
        for (let i = en.length - 1; i >= 0; i--) if (en[i].dead || en[i].x < -12 || en[i].x > w + 12) en.splice(i, 1)
        for (let i = bl.length - 1; i >= 0; i--) if (bl[i].gone || bl[i].x < -4 || bl[i].x > w + 4 || bl[i].y < -4 || bl[i].y > h) bl.splice(i, 1)
        fx.update(dt)

        // ── draw ──
        rect(ctx, bugs ? '#1b1038' : '#12324f', 0, 0, w, h)
        if (bugs) { for (let i = 0; i < w; i += 12) rect(ctx, '#2a1a5a', i, 0, 1, h); for (let j = 0; j < h; j += 12) rect(ctx, '#2a1a5a', 0, j, w, 1) }
        else {
          rect(ctx, '#ff9f5a', 0, GY - 34, w, 2); rect(ctx, '#ff6f7a', 0, GY - 38, w, 4)
          const off = -(hero.x * 0.12) % 9
          tree.forEach((tr) => { const x = tr.x + off; rect(ctx, '#0e4a3a', x, GY - tr.h, 7, tr.h); rect(ctx, '#157a4e', x + 1, GY - tr.h, 5, 3) })
        }
        en.forEach((e) => {
          const y = e.y + e.rise * 8
          if (bugs) sprite(ctx, BUG, { g: '#8aff4d', w: '#fff' }, e.x - 3, y - 5, e.vx < 0)
          else { rect(ctx, '#9aa4b8', e.x - 2, y - 7, 4, 5); rect(ctx, '#f2b88f', e.x - 1, y - 9, 3, 2); rect(ctx, '#444', e.x - 2, y - 2, 4, 2) }
        })
        rect(ctx, bugs ? '#6b3fa0' : '#5a3a1a', 0, GY, w, h - GY)
        rect(ctx, bugs ? '#ff3d8b' : '#4cc35a', 0, GY, w, 2)
        // commando
        const hx = Math.round(hero.x) - 3, hy = GY - 10, f = Math.floor(hero.run) % 2
        sprite(ctx, ['.rrrrr.', '..sss..', '.sssss.', '.sssss.', '.sssss.', '..bbb..', '..bbb..'], { r: '#ff3040', s: '#f2b88f', b: '#2b5cff' }, hx, hy, hero.dir < 0)
        if (f) rect(ctx, '#2b5cff', hx + 2, hy + 7, 3, 2); else { rect(ctx, '#2b5cff', hx + 1, hy + 7, 2, 2); rect(ctx, '#2b5cff', hx + 4, hy + 7, 2, 2) }
        rect(ctx, '#222', hx + (f ? 2 : 1), hy + 9, 3, 1)
        for (let i = 3; i < 8; i++) rect(ctx, '#d8d8d8', hero.x + Math.cos(aimAng) * i, GY - 8 + Math.sin(aimAng) * i, 1, 1)
        bl.forEach((b) => rect(ctx, b.user ? C.yellow : '#fff', b.x - 1, b.y - 1, 2, 2))
        fx.draw(ctx, 6)
      },
    }
  }
}

// ───────────────────────── SPACE INVADERS ─────────────────────────
const INV = ['..i...i..', '...i.i...', '..iiiii..', '.ii.i.ii.', 'iiiiiiiii', 'i.iiiii.i']
export function invaders() {
  return (api) => {
    const { ctx, w, h, mouse } = api
    const fx = new Fx(), bl = []
    const stars = Array.from({ length: 18 }, () => ({ x: rnd(0, w), y: rnd(0, h), p: rnd(0, 6) }))
    let inv = [], dir = 1, oy = 8, ox = 6, cool = 0.3, bigCool = 0, ship = w / 2, respawn = 0
    const reset = () => { inv = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) inv.push({ c, r, alive: true }); oy = 8; ox = 6 }
    reset()
    return {
      click() {
        if (!api.live.current.lit && !api.live.current.play) return
        if (bigCool <= 0) { bl.push({ x: ship, y: h - 14, vy: -90, big: true, user: true }); bigCool = 0.5; api.snd('shoot') }
      },
      tick(dt, t) {
        const tx = mouse.near ? clamp(mouse.x, 6, w - 6) : w / 2 + Math.sin(t * 1.2) * 26
        ship += clamp(tx - ship, -50 * dt, 50 * dt)
        cool -= dt; bigCool -= dt
        if (cool <= 0) { bl.push({ x: ship, y: h - 14, vy: -80, big: false }); cool = 0.42; api.snd('hover', 700) }
        ox += dir * 9 * dt
        if (ox > w - 62 || ox < 2) { dir *= -1; oy += 3 }
        if (oy > h - 36) reset()
        bl.forEach((b) => {
          b.y += b.vy * dt
          inv.forEach((v) => {
            if (!v.alive) return
            const x = ox + v.c * 11, y = oy + v.r * 9
            if (b.x > x - 1 && b.x < x + 10 && b.y > y && b.y < y + 7) {
              v.alive = false; if (!b.big) b.gone = true
              fx.burst(x + 4, y + 3, [C.pink, C.blue, C.yellow, C.green, '#fff'], 12)
              fx.pop('+100', clamp(x + 4, 14, w - 14), y - 2, C.yellow)
              if (b.user) api.score(100)
              api.snd('pop')
            }
          })
        })
        for (let i = bl.length - 1; i >= 0; i--) if (bl[i].gone || bl[i].y < -6) bl.splice(i, 1)
        if (!inv.some((v) => v.alive)) { respawn += dt; if (respawn > 0.9) { respawn = 0; reset() } }
        fx.update(dt)

        rect(ctx, '#0a0a24', 0, 0, w, h)
        stars.forEach((s) => { if (Math.sin(t * 3 + s.p) > -0.3) rect(ctx, '#9fb4ff', s.x, s.y, 1, 1) })
        inv.forEach((v) => { if (v.alive) sprite(ctx, INV, { i: ['#35ff7a', '#2bb5ff', '#ff3d8b'][v.r] }, ox + v.c * 11, oy + v.r * 9 + (Math.floor(t * 2) % 2)) })
        rect(ctx, '#fff', ship - 3, h - 10, 7, 3); rect(ctx, '#2bb5ff', ship - 1, h - 13, 3, 3); rect(ctx, '#ff3d8b', ship - 4, h - 8, 1, 2); rect(ctx, '#ff3d8b', ship + 4, h - 8, 1, 2)
        bl.forEach((b) => rect(ctx, b.big ? C.yellow : '#fff', b.x - (b.big ? 2 : 0), b.y, b.big ? 5 : 1, b.big ? 6 : 3))
        rect(ctx, '#35ff7a', 0, h - 3, w, 1)
        fx.draw(ctx, 6)
      },
    }
  }
}

// ───────────────────────── PAC-MAN ─────────────────────────
const MAZE = ['#########', '#.......#', '#.##.##.#', '#.......#', '#.#...#.#', '#.......#', '#.##.##.#', '#.......#', '#########']
const G7 = ['..ggg..', '.ggggg.', 'gwbgwbg', 'ggggggg', 'ggggggg', 'ggggggg', 'g.g.g.g']
const open = (c, r) => MAZE[r] && MAZE[r][c] && MAZE[r][c] !== '#'
export function pacman() {
  return (api) => {
    const { ctx, w, h, mouse } = api
    const fx = new Fx()
    const mkA = (c, r, spd) => ({ c, r, tc: c, tr: r, p: 1, spd, d: null, x: c * 8 + 4, y: r * 8 + 4 })
    const walk = (a, dt, choose) => {
      if (a.p >= 1) {
        a.c = a.tc; a.r = a.tr
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter((d) => open(a.c + d[0], a.r + d[1]))
        let opts = dirs.filter((d) => !(a.d && d[0] === -a.d[0] && d[1] === -a.d[1]))
        if (!opts.length) opts = dirs
        const d = choose(opts, a); a.d = d; a.tc = a.c + d[0]; a.tr = a.r + d[1]; a.p = 0
      }
      a.p += dt * a.spd
      const p = Math.min(1, a.p)
      a.x = (lerp(a.c, a.tc, p) + 0.5) * 8; a.y = (lerp(a.r, a.tr, p) + 0.5) * 8
    }
    const pac = mkA(1, 1, 3.4), gh = [mkA(7, 7, 2.6), mkA(7, 1, 2.4)]
    const pel = new Set(); const refill = () => MAZE.forEach((row, r) => [...row].forEach((ch, c) => ch === '.' && pel.add(c + ',' + r)))
    refill()
    let wander = [3, 3], wt = 0
    const cols = ['#ff4040', '#2bd9ff']
    return {
      click() {},
      tick(dt, t) {
        wt -= dt
        if (wt <= 0) { wt = 2.5; const cells = []; MAZE.forEach((row, r) => [...row].forEach((ch, c) => ch !== '#' && cells.push([c, r]))); wander = pick(cells) }
        const power = mouse.near && mouse.down && api.live.current.lit
        const tgt = mouse.near ? [Math.floor(mouse.x / 8), Math.floor(mouse.y / 8)] : wander
        const dist = (c, r, tx, ty) => (c - tx) ** 2 + (r - ty) ** 2
        walk(pac, dt, (opts, a) => opts.reduce((b, d) => (dist(a.c + d[0], a.r + d[1], tgt[0], tgt[1]) < dist(a.c + b[0], a.r + b[1], tgt[0], tgt[1]) ? d : b)))
        gh.forEach((g) => {
          g.spd = power ? 1.8 : 2.5
          walk(g, dt, (opts, a) => {
            if (!power && Math.random() < 0.2) return pick(opts)
            const sc = (d) => dist(a.c + d[0], a.r + d[1], pac.c, pac.r)
            return opts.reduce((b, d) => ((power ? sc(d) > sc(b) : sc(d) < sc(b)) ? d : b))
          })
          if (Math.hypot(g.x - pac.x, g.y - pac.y) < 5) {
            if (power) { fx.pop('200', g.x, g.y - 6, '#2bd9ff'); api.score(200); api.snd('eat') }
            g.c = g.tc = 7; g.r = g.tr = 4; g.p = 1; g.d = null
          }
        })
        const key = Math.round(pac.x / 8 - 0.5) + ',' + Math.round(pac.y / 8 - 0.5)
        if (pel.delete(key)) api.snd('hover', 300)
        if (!pel.size) refill()
        fx.update(dt)

        rect(ctx, '#05030f', 0, 0, w, h)
        MAZE.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '#') { rect(ctx, '#2b3cff', c * 8, r * 8, 8, 8); rect(ctx, '#0a0f3a', c * 8 + 1, r * 8 + 1, 6, 6) } }))
        pel.forEach((k) => { const [c, r] = k.split(',').map(Number); rect(ctx, '#ffd9a0', c * 8 + 3, r * 8 + 3, 2, 2) })
        gh.forEach((g, i) => sprite(ctx, G7, power ? { g: '#2b2bff', w: '#ffe', b: '#ffe' } : { g: cols[i], w: '#fff', b: '#2b4bff' }, g.x - 3, g.y - 3))
        const mouth = [0, 40, 80, 40][Math.floor(t * 12) % 4]
        const d = pac.d || [1, 0]
        ctx.save(); ctx.translate(Math.round(pac.x), Math.round(pac.y)); ctx.rotate(Math.atan2(d[1], d[0]))
        sprite(ctx, circleRows(3, mouth), { y: '#ffe34d' }, -3, -3)
        ctx.restore()
        fx.draw(ctx, 6)
      },
    }
  }
}

// ───────────────────────── MARIO-STYLE RUNNER ─────────────────────────
const PLUMB = ['..rrrr.', '.rrrrrr', '..sssk.', '.ssssss', '..bbrb.', '.bbbbbb', '.bbbbbb']
export function plumber() {
  return (api) => {
    const { ctx, w, h } = api
    const fx = new Fx(), GY = h - 12
    const m = { y: GY, vy: 0, user: false }
    const pipes = [], blocks = [], coins = []
    const clouds = [{ x: 10, y: 8 }, { x: 50, y: 18 }, { x: 90, y: 6 }]
    let sp = 1.2, sb = 3, off = 0
    const jump = (user) => { if (m.y >= GY) { m.vy = -125; m.user = user; api.snd('jump') } }
    return {
      click() { if (api.live.current.lit || api.live.current.play) jump(true) },
      tick(dt, t) {
        const V = 36
        off += V * dt
        sp -= dt; sb -= dt
        if (sp <= 0) { sp = rnd(1.5, 2.4); pipes.push({ x: w + 4 }) }
        if (sb <= 0) { sb = rnd(2.4, 3.6); blocks.push({ x: w + 4, y: GY - 34, hit: false, bump: 0 }) }
        pipes.forEach((p) => (p.x -= V * dt)); blocks.forEach((b) => { b.x -= V * dt; b.bump = Math.max(0, b.bump - dt * 30) })
        clouds.forEach((c) => { c.x -= 4 * dt; if (c.x < -16) c.x = w + 4 })
        if (pipes.some((p) => p.x > 14 && p.x < 34) && m.y >= GY) jump(false)
        m.vy += 320 * dt; m.y += m.vy * dt
        if (m.y >= GY) { m.y = GY; m.vy = 0 }
        blocks.forEach((b) => {
          if (!b.hit && m.vy < 0 && m.y - 9 <= b.y + 8 && m.y - 9 > b.y - 2 && b.x < 22 && b.x + 8 > 12) {
            b.hit = true; b.bump = 3; m.vy = 30
            coins.push({ x: b.x + 4, y: b.y - 2, vy: -70 }); fx.pop('+100', b.x + 4, b.y - 12, C.yellow)
            api.snd('coin'); if (m.user) api.score(100)
          }
        })
        coins.forEach((c) => { c.vy += 200 * dt; c.y += c.vy * dt; c.life = (c.life || 0) + dt })
        while (pipes[0] && pipes[0].x < -14) pipes.shift()
        while (blocks[0] && blocks[0].x < -10) blocks.shift()
        while (coins[0] && coins[0].life > 0.6) coins.shift()
        fx.update(dt)

        rect(ctx, '#5c94fc', 0, 0, w, h)
        clouds.forEach((c) => { rect(ctx, '#fff', c.x, c.y + 3, 16, 4); rect(ctx, '#fff', c.x + 3, c.y, 10, 3) })
        for (let i = 0; i < 3; i++) { const hx = ((i * 40 - off * 0.3) % 120 + 120) % 120 - 30; rect(ctx, '#3fa34d', hx, GY - 10, 26, 10); rect(ctx, '#3fa34d', hx + 5, GY - 15, 16, 5) }
        rect(ctx, '#c8561e', 0, GY, w, h - GY)
        for (let i = -1; i < w / 12 + 1; i++) { const x = i * 12 - (off % 12); rect(ctx, '#7a2e0e', x, GY, 1, h - GY); rect(ctx, '#7a2e0e', x, GY + 5, 12, 1) }
        rect(ctx, '#ffd36b', 0, GY, w, 1)
        pipes.forEach((p) => { rect(ctx, '#1e9a2e', p.x, GY - 12, 10, 12); rect(ctx, '#2fd04a', p.x - 1, GY - 12, 12, 4); rect(ctx, '#0a5a14', p.x + 8, GY - 8, 2, 8) })
        blocks.forEach((b) => {
          const y = b.y - b.bump
          rect(ctx, b.hit ? '#7a5a2a' : '#ffb520', b.x, y, 8, 8); rect(ctx, '#7a3a0a', b.x, y, 8, 1); rect(ctx, '#7a3a0a', b.x, y + 7, 8, 1)
          if (!b.hit) text(ctx, '?', b.x + 1, y + 1, { size: 6, color: '#fff' })
        })
        coins.forEach((c) => { rect(ctx, '#ffe34d', c.x - 1, c.y, 3, 5); rect(ctx, '#fff', c.x, c.y + 1, 1, 3) })
        const y = Math.round(m.y) - 9
        sprite(ctx, PLUMB, { r: '#e8262a', s: '#f2b88f', k: '#4a2a10', b: '#2b4bff' }, 14, y)
        const f = m.y < GY ? 2 : Math.floor(off / 4) % 2
        if (f === 2) { rect(ctx, '#2b4bff', 14, y + 7, 3, 2); rect(ctx, '#2b4bff', 18, y + 7, 3, 2) }
        else if (f) rect(ctx, '#2b4bff', 16, y + 7, 3, 2); else { rect(ctx, '#2b4bff', 15, y + 7, 2, 2); rect(ctx, '#2b4bff', 18, y + 7, 2, 2) }
        rect(ctx, '#4a2a10', 14, y + 9, 7, 1)
        fx.draw(ctx, 6)
      },
    }
  }
}

// ───────────────────────── TETRIS (also used for EduLib shelves) ─────────────────────────
const SH = { I: [[1, 1, 1, 1]], O: [[1, 1], [1, 1]], T: [[0, 1, 0], [1, 1, 1]], S: [[0, 1, 1], [1, 1, 0]], Z: [[1, 1, 0], [0, 1, 1]], J: [[1, 0, 0], [1, 1, 1]], L: [[0, 0, 1], [1, 1, 1]] }
const TC = { I: '#2bd9ff', O: '#ffe34d', T: '#c05cff', S: '#35ff7a', Z: '#ff4040', J: '#2b5cff', L: '#ff9f5a' }
const STATUS = [['AVAILABLE', '#35ff7a'], ['ISSUED', '#ff9f5a'], ['RESERVED', '#ff3d8b']]
const rotM = (m) => m[0].map((_, i) => m.map((r) => r[i]).reverse())
export function tetris({ cell = 4, ox = 16, rows = 18, books = false } = {}) {
  return (api) => {
    const { ctx, w, h, mouse } = api
    const fx = new Fx(), COLS = 10
    let grid = Array.from({ length: rows }, () => Array(COLS).fill(null))
    let p = null, drop = 0, mv = 0, flip = 0, lastStatus = 0, target = 0
    const fits = (m, x, y) => m.every((r, j) => r.every((v, i) => !v || (x + i >= 0 && x + i < COLS && y + j < rows && (y + j < 0 || !grid[y + j][x + i]))))
    const spawn = () => {
      const k = pick(Object.keys(SH)); let m = SH[k]; const turns = (Math.random() * 4) | 0
      for (let i = 0; i < turns; i++) m = rotM(m)
      p = { k, m, x: 3, y: -1, st: (Math.random() * 3) | 0 }
      target = (Math.random() * (COLS - m[0].length + 1)) | 0
      if (!fits(m, p.x, 0)) grid = Array.from({ length: rows }, () => Array(COLS).fill(null))
    }
    spawn()
    return {
      click() {
        if (!api.live.current.lit && !api.live.current.play) return
        const m = rotM(p.m); if (fits(m, p.x, p.y)) { p.m = m; api.snd('beep', 600) }
      },
      tick(dt, t) {
        mv -= dt; drop -= dt
        const near = mouse.near && mouse.inside
        const want = near ? clamp(Math.floor((mouse.x - ox) / cell - p.m[0].length / 2 + 0.5), 0, COLS - p.m[0].length) : target
        if (mv <= 0 && p.x !== want) { const nx = p.x + Math.sign(want - p.x); if (fits(p.m, nx, p.y)) p.x = nx; mv = 0.09 }
        if (drop <= 0) {
          drop = near ? 0.28 : 0.2
          if (fits(p.m, p.x, p.y + 1)) p.y++
          else {
            p.m.forEach((r, j) => r.forEach((v, i) => { if (v && p.y + j >= 0) grid[p.y + j][p.x + i] = books ? STATUS[p.st][1] : TC[p.k] }))
            if (books) { lastStatus = p.st; flip = 0.5 }
            for (let r = rows - 1; r >= 0; r--) if (grid[r].every(Boolean)) {
              grid.splice(r, 1); grid.unshift(Array(COLS).fill(null)); r++
              fx.burst(ox + (COLS * cell) / 2, r * cell, [C.pink, C.blue, C.yellow, C.green], 16); fx.pop(books ? 'SHELVED!' : '+100', ox + (COLS * cell) / 2, r * cell - 6, C.yellow); api.snd('coin')
            }
            spawn()
          }
        }
        flip = Math.max(0, flip - dt)
        fx.update(dt)

        rect(ctx, books ? '#1d2b5a' : '#10102a', 0, 0, w, h)
        rect(ctx, '#0a0a1c', ox - 1, 0, COLS * cell + 2, h)
        if (books) for (let r = 3; r < rows; r += 4) rect(ctx, '#8a5a2a', ox - 1, (r + 1) * cell - 1, COLS * cell + 2, 1)
        const blk = (x, y, c) => { rect(ctx, c, x, y, cell, cell); rect(ctx, 'rgba(255,255,255,.35)', x, y, cell, 1); rect(ctx, 'rgba(0,0,0,.3)', x, y + cell - 1, cell, 1) }
        grid.forEach((row, j) => row.forEach((c, i) => c && blk(ox + i * cell, j * cell, c)))
        p.m.forEach((r, j) => r.forEach((v, i) => v && blk(ox + (p.x + i) * cell, (p.y + j) * cell, books ? STATUS[p.st][1] : TC[p.k])))
        if (books) {
          const [lab, col] = STATUS[lastStatus], sx = ox + COLS * cell + 8
          STATUS.forEach(([l, c], i) => { rect(ctx, c, sx, 14 + i * 14, 5, 5); text(ctx, l, sx + 8, 12 + i * 14, { size: 8, color: '#fff' }) })
          const sh = Math.abs(Math.cos(flip * 6)) * 12
          rect(ctx, col, sx, h - 30 + (12 - sh) / 2, 54, sh)
          if (sh > 8) text(ctx, lab, sx + 27, h - 28 + 2, { size: 6, color: '#000', align: 'center' })
        }
        fx.draw(ctx, 6)
      },
    }
  }
}

// ───────────────────────── RACING (top-down) ─────────────────────────
const drawCar = (ctx, x, y, col, spin = 0) => {
  if (spin) { ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(spin); x = 0; y = 0 }
  rect(ctx, '#111', x - 5, y - 4, 2, 4); rect(ctx, '#111', x + 3, y - 4, 2, 4); rect(ctx, '#111', x - 5, y + 3, 2, 4); rect(ctx, '#111', x + 3, y + 3, 2, 4)
  rect(ctx, col, x - 3, y - 6, 6, 13); rect(ctx, '#bff', x - 2, y - 2, 4, 3); rect(ctx, '#fff', x - 2, y - 6, 1, 1); rect(ctx, '#fff', x + 1, y - 6, 1, 1)
  if (spin) ctx.restore()
}
export function racing() {
  return (api) => {
    const { ctx, w, h, mouse } = api
    const fx = new Fx(), cars = []
    const lanes = [20, 36, 52]
    const me = { x: 36, y: h - 14, spin: 0, hit: 0 }
    let sp = 0.5, off = 0
    return {
      click() {},
      tick(dt, t) {
        off += 70 * dt; sp -= dt
        if (sp <= 0) { sp = rnd(0.7, 1.3); cars.push({ x: pick(lanes), y: -10, v: rnd(30, 50), c: pick(['#2bd9ff', '#ffe34d', '#35ff7a', '#fff'])}) }
        let tx
        if (mouse.near) tx = clamp(mouse.x, 18, 54)
        else { const free = lanes.filter((l) => !cars.some((c) => Math.abs(c.x - l) < 8 && c.y > h - 50 && c.y < h)); tx = free.length ? free.reduce((b, l) => (Math.abs(l - me.x) < Math.abs(b - me.x) ? l : b)) : me.x }
        me.x += clamp(tx - me.x, -48 * dt, 48 * dt)
        me.hit = Math.max(0, me.hit - dt); me.spin = me.hit > 0 ? me.spin + dt * 14 : 0
        cars.forEach((c) => {
          c.y += (c.v + 40) * dt
          if (!c.dead && Math.abs(c.x - me.x) < 7 && Math.abs(c.y - me.y) < 11) { c.dead = true; me.hit = 0.5; fx.pop('CRASH!', me.x, me.y - 14, C.red); fx.burst(me.x, me.y, ['#fff', C.orange, C.red], 8); api.snd('pop') }
        })
        for (let i = cars.length - 1; i >= 0; i--) if (cars[i].dead || cars[i].y > h + 12) cars.splice(i, 1)
        fx.update(dt)

        rect(ctx, '#3fa34d', 0, 0, w, h)
        for (let j = -1; j < h / 8 + 1; j++) { const y = j * 8 + (off % 8); rect(ctx, j % 2 ? '#e8262a' : '#fff', 10, y, 2, 4); rect(ctx, j % 2 ? '#e8262a' : '#fff', 60, y, 2, 4) }
        rect(ctx, '#444', 12, 0, 48, h)
        for (let j = -1; j < h / 14 + 1; j++) { const y = j * 14 + (off % 14); rect(ctx, '#ffe34d', 27, y, 1, 7); rect(ctx, '#ffe34d', 43, y, 1, 7) }
        cars.forEach((c) => drawCar(ctx, c.x, c.y, c.c))
        drawCar(ctx, me.x, me.y, '#ff3d8b', me.spin)
        fx.draw(ctx, 6)
      },
    }
  }
}
export { drawCar }
