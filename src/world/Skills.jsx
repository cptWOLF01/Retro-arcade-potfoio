import { useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import Win from '../components/Win'
import Px from '../components/Px'
import { skillGroups } from '../data/content'
import { circleRows, GHOST, ghostPal } from '../lib/gfx'
import { sfx } from '../lib/audio'
import { store } from '../lib/store'

const GLYPHS = [
  ['..ccc..', '.ccccc.', 'ccccccc', '.ccccc.', '..ccc..', '...c...'],
  ['.c.c.c.', 'ccccccc', '.c...c.', 'ccc.ccc', '.c...c.', 'ccccccc', '.c.c.c.'],
  ['...c...', '...c...', 'ccccccc', '.ccccc.', '..ccc..', '.cc.cc.', '.c...c.'],
  ['...ccc.', '..cc...', '.ccc...', 'ccccccc', '...cc..', '..cc...', '.c.....'],
  ['..ccc..', '.c.c.c.', 'c..c..c', '.ccccc.', '.c...c.', '..ccc..'],
]
const PAC_A = circleRows(6, 70), PAC_B = circleRows(6, 0)

function Group({ g, gi }) {
  const ref = useRef(null), eaten = useRef(0)
  const [p, setP] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 88%', 'end 55%'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const q = Math.round(Math.min(1, Math.max(0, v)) * 60) / 60
    setP(q)
    const n = Math.min(g.skills.length, Math.floor(q * (g.skills.length + 0.5)))
    if (n > eaten.current) { store.addScore(50 * (n - eaten.current)); sfx.eat(); eaten.current = n }
  })
  const n = g.skills.length
  const eatenN = Math.min(n, Math.floor(p * (n + 0.5)))
  const pos = 3 + p * 90
  return (
    <div ref={ref} className="reveal">
      <Win title={g.name} color={g.color} className="skill-win">
        <div className="maze" aria-hidden="true">
          <div className="dots">{Array.from({ length: 28 }).map((_, i) => <i key={i} className={(i / 28) * 100 + 3 < pos ? 'gone' : ''} />)}</div>
          {p < 0.94 && [0, 1].map((k) => <span key={k} className="mghost" style={{ left: `${Math.min(96, pos + 9 + k * 6)}%` }}><Px rows={GHOST} pal={ghostPal('#2b2bff', '#fff')} s={2} /></span>)}
          <span className="pac" style={{ left: `${pos}%` }}>
            <span className="pa"><Px rows={PAC_A} pal={{ y: '#ffe34d' }} s={3} /></span>
            <span className="pb"><Px rows={PAC_B} pal={{ y: '#ffe34d' }} s={3} /></span>
          </span>
        </div>
        <ul className="chips">
          {g.skills.map((s, i) => {
            const on = i < eatenN
            return (
              <li key={s} className={`chip ${on ? 'on' : ''}`} style={{ '--g': g.color }}>
                <span className="chip-ico" aria-hidden="true">
                  {on ? <Px rows={GLYPHS[(i * 3 + gi) % 5]} pal={{ c: '#0b1020' }} s={3} /> : <i className="pellet" />}
                </span>
                <span>{s}</span>
              </li>
            )
          })}
        </ul>
      </Win>
    </div>
  )
}

export default function Skills() {
  return (
    <section id="world-1-2" data-world className="world" aria-labelledby="h-skills">
      <div className="wrap">
        <p className="eyebrow reveal">WORLD 1-2</p>
        <h2 id="h-skills" className="pix-title reveal">SKILLS</h2>
        <p className="lead reveal">Pac-Man eats the pellets as you scroll, and every pellet turns into a skill. The ghosts are just along for the ride.</p>
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          {skillGroups.map((g, i) => <Group key={g.name} g={g} gi={i} />)}
        </div>
      </div>
    </section>
  )
}
