import { useState } from 'react'
import PixelCanvas from '../components/PixelCanvas'
import Win from '../components/Win'
import { projects } from '../data/content'
import { scenes, SCENE_SIZE } from '../games/projects'
import { sfx } from '../lib/audio'

function Card({ p, i }) {
  const [play, setPlay] = useState(false)
  const [booked, setBooked] = useState(false)
  return (
    <Win title={`LEVEL 2-${i + 1}`} color={['#ff8cc0', '#7cc8ff', '#b9f27c', '#c9b3ff', '#ffd36b'][i]} className="reveal proj">
      <div className={`flex flex-col gap-5 ${i % 2 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        <div className="scene-wrap lg:w-[52%]">
          <PixelCanvas w={SCENE_SIZE.w} h={SCENE_SIZE.h} make={scenes[p.scene]} play={play} lit={play} label={`${p.title} mini-game scene`} />
          {!play && (
            <button className="press-start" onClick={() => { setPlay(true); sfx.coin() }}>
              <span>PRESS START</span><small>TO PLAY</small>
            </button>
          )}
          {play && <span className="scene-hint">{p.hint}</span>}
        </div>
        <div className="lg:w-[48%] flex flex-col">
          <h3 className="font-pixel text-[11px] leading-5 text-navy">{p.title}</h3>
          <p className="text-xl leading-6 text-navy/90 mt-3">{p.desc}</p>
          <ul className="tags mt-3">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          {p.badge && <p className="badge-line mt-3"><span aria-hidden="true">★</span> {p.badge}</p>}
          <div className="mt-auto pt-5 flex flex-wrap gap-3">
            <a className="pix-btn" href={p.link} onClick={() => sfx.click()}>VIEW PROJECT</a>
            {p.id === 'health' && (
              <button className="pix-btn alt" onClick={() => { setBooked(true); sfx.coin() }}>{booked ? 'BOOKED! (DEMO)' : 'BOOK APPOINTMENT'}</button>
            )}
          </div>
        </div>
      </div>
    </Win>
  )
}

export default function Projects() {
  return (
    <section id="world-2" data-world className="world" aria-labelledby="h-proj">
      <div className="wrap">
        <p className="eyebrow reveal">WORLD 2</p>
        <h2 id="h-proj" className="pix-title reveal">PROJECTS</h2>
        <p className="lead reveal">Five levels. Each scene runs by itself; press START to take the controls.</p>
        <div className="space-y-10 mt-10">{projects.map((p, i) => <Card key={p.id} p={p} i={i} />)}</div>
      </div>
    </section>
  )
}
