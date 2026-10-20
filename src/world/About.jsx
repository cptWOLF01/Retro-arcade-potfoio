import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Win from '../components/Win'
import Px from '../components/Px'
import { aboutCards, profile } from '../data/content'
import { FR, PAL } from '../lib/sprites'
import { sfx } from '../lib/audio'
import { store, reducedMotion } from '../lib/store'

function QCard({ card, i, wide }) {
  const reduced = reducedMotion()
  const [open, setOpen] = useState(reduced)
  const [bump, setBump] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.7, once: true })
  const hit = (user) => {
    if (open) return
    setBump(true); setOpen(true); sfx.coin(); store.addScore(100)
  }
  useEffect(() => {
    if (!inView || open) return
    const id = setTimeout(() => hit(false), 700 + i * 220)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])
  return (
    <div ref={ref} className={`qcard reveal ${wide ? 'sm:col-span-2' : ''}`}>
      {!open && <button className="qblock" onClick={() => hit(true)} aria-label={`Hit the ? block to reveal: ${card.title}`}>?</button>}
      {bump && <motion.span className="coin-pop" initial={{ y: 0, opacity: 1 }} animate={{ y: -60, opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} aria-hidden="true">+100</motion.span>}
      <motion.div animate={open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }} transition={{ duration: 0.35 }} style={{ height: '100%' }}>
        <Win title={card.title} color={['#ff8cc0', '#7cc8ff', '#ffd36b', '#b9f27c', '#c9b3ff'][i % 5]} bodyClass="space-y-1" className="h-full">
          {card.lines.map((l, k) => <p key={k} className={k === 0 ? 'text-xl text-navy' : 'text-lg text-navy/80'}>{l}</p>)}
        </Win>
      </motion.div>
    </div>
  )
}

function Stat({ label, value, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.8, once: true })
  return (
    <div ref={ref} className="stat" role="img" aria-label={`${label} ${value} out of 10`}>
      <span className="font-pixel text-[9px] w-24 shrink-0">{label}</span>
      <span className="segs">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.i key={i} initial={false} animate={{ backgroundColor: inView && i < value ? '#ff3d8b' : '#dcd2b4' }} transition={{ delay: delay + i * 0.06, duration: 0.01 }} />
        ))}
      </span>
      <span className="font-pixel text-[9px] w-10 text-right">{value}/10</span>
    </div>
  )
}

function Portrait() {
  const [bad, setBad] = useState(false)
  return (
    <div className="portrait-frame">
      {bad ? (
        <div className="portrait-fallback"><Px rows={FR.idle} pal={PAL} s={10} label="Pixel avatar of Himanshu (add public/me-beach.png to show the real photo)" /></div>
      ) : (
        <img src={profile.photo} alt={profile.photoAlt} onError={() => setBad(true)} loading="lazy" />
      )}
      <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
    </div>
  )
}

export default function About() {
  return (
    <section id="world-1-1" data-world className="world" aria-labelledby="h-about">
      <div className="pipe left" aria-hidden="true" /><div className="pipe right" aria-hidden="true" />
      <div className="wrap">
        <p className="eyebrow reveal">WORLD 1-1</p>
        <h2 id="h-about" className="pix-title reveal">ABOUT ME</h2>
        <p className="lead reveal">Hit the <b>?</b> blocks (or just keep scrolling) to unlock my player card.</p>
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 mt-10 items-start">
          <div className="grid sm:grid-cols-2 gap-6">
            {aboutCards.map((c, i) => <QCard key={c.title} card={c} i={i} wide={i === 4} />)}
          </div>
          <Win title="PLAYER PROFILE · SELECT" color="#ff3d8b" className="reveal lg:sticky lg:top-24">
            <Portrait />
            <div className="mt-5">
              <p className="font-pixel text-[11px] leading-5 text-navy">{profile.name.toUpperCase()}</p>
              <p className="text-base text-navy/70 mt-1">CLASS: FULL-STACK DEVELOPER</p>
              <div className="mt-4 space-y-2">{profile.stats.map((s, i) => <Stat key={s.label} {...s} delay={i * 0.2} />)}</div>
            </div>
            <p className="text-xl text-navy mt-5 leading-6">{profile.bio}</p>
          </Win>
        </div>
      </div>
    </section>
  )
}
