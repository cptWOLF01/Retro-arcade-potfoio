import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import PixelCanvas from '../components/PixelCanvas'
import Win from '../components/Win'
import { experience } from '../data/content'
import { contra } from '../games/hero'

const stage = contra({ bugs: true })

function Boss({ job, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.6, once: true })
  return (
    <div ref={ref} className="reveal">
      <Win title={`CHECKPOINT ${i + 1} · ${job.boss}`} color={i ? '#c9b3ff' : '#ff9f5a'}>
        <div className="flex items-center gap-3 mb-3" role="img" aria-label={`${job.boss} defeated`}>
          <span className="font-pixel text-[9px] text-navy">{job.boss}</span>
          <span className="hp"><motion.i initial={{ width: '100%' }} animate={{ width: inView ? '0%' : '100%' }} transition={{ delay: 0.4, duration: 1.6, ease: 'linear' }} /></span>
          <span className="font-pixel text-[9px] text-hot">{inView ? 'CLEARED' : ''}</span>
        </div>
        <h3 className="font-pixel text-[11px] leading-5 text-navy">{job.role}</h3>
        <p className="text-xl text-navy/80 mt-1">{job.org}</p>
        <ul className="bullets mt-3">{job.points.map((p) => <li key={p}>{p}</li>)}</ul>
      </Win>
    </div>
  )
}

export default function Experience() {
  const [lit, setLit] = useState(false)
  return (
    <section id="world-3" data-world className="world" aria-labelledby="h-exp">
      <div className="wrap">
        <p className="eyebrow reveal">WORLD 3</p>
        <h2 id="h-exp" className="pix-title reveal">EXPERIENCE</h2>
        <p className="lead reveal">A run-and-gun stage: squash the bugs, beat the bosses.</p>
        <div className="reveal mt-8">
          <Win title="STAGE 3 · BUG HUNT" color="#35ff7a">
            <div className="stage" onPointerEnter={() => setLit(true)} onPointerLeave={() => setLit(false)}>
              <PixelCanvas w={240} h={72} make={stage} lit={lit} play={lit} dim={false} label="Bug hunt stage: a pixel commando shoots bugs. Aim with the cursor, click to shoot." />
              <span className="scene-hint">MOVE = AIM · CLICK = SHOOT</span>
            </div>
          </Win>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mt-8">{experience.map((j, i) => <Boss key={j.role} job={j} i={i} />)}</div>
      </div>
    </section>
  )
}
