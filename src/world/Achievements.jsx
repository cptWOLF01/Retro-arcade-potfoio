import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import Win from '../components/Win'
import Px from '../components/Px'
import { badges, leaderboard } from '../data/content'
import { ITEMS, STAR } from '../lib/sprites'
import { bus, store } from '../lib/store'
import { sfx } from '../lib/audio'

export default function Achievements() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.45, once: true })
  useEffect(() => {
    if (!inView) return
    bus.emit('confetti', { x: innerWidth * 0.3, y: innerHeight * 0.7, n: 90 })
    setTimeout(() => bus.emit('confetti', { x: innerWidth * 0.7, y: innerHeight * 0.7, n: 90 }), 250)
    store.addScore(500); sfx.win()
  }, [inView])
  return (
    <section id="world-4" data-world className="world" aria-labelledby="h-ach">
      <div className="wrap" ref={ref}>
        <p className="eyebrow reveal">WORLD 4</p>
        <h2 id="h-ach" className="pix-title reveal">ACHIEVEMENTS</h2>
        <div className="reveal mt-8">
          <Win title="HIGH SCORES" color="#ff3d8b" bodyClass="!bg-navy overflow-x-auto">
            <table className="lb">
              <caption className="sr-only">Hackathon results leaderboard</caption>
              <thead><tr><th scope="col">RANK</th><th scope="col">EVENT</th><th scope="col">RESULT</th><th scope="col">PROJECT</th></tr></thead>
              <tbody>
                {leaderboard.map((r) => (
                  <tr key={r.rank}>
                    <th scope="row" className="rank">{r.rank}</th><td>{r.event}</td><td className="res">{r.result}</td><td>{r.project}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Win>
        </div>
        <h3 className="font-pixel text-[11px] mt-12 reveal pix-sub">LEADERSHIP BADGES</h3>
        <div className="grid sm:grid-cols-2 gap-6 mt-5">
          {badges.map((b) => (
            <div key={b.title} className="reveal badge-card">
              <Px rows={b.icon === 'ball' ? ITEMS.ball.rows : STAR} pal={b.icon === 'ball' ? ITEMS.ball.pal : { y: '#ffd23d' }} s={6} />
              <div><p className="font-pixel text-[10px] text-navy">{b.title}</p><p className="text-xl text-navy/80 leading-5 mt-2">{b.sub}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
