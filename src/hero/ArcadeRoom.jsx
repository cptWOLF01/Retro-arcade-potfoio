import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import PixelCanvas from '../components/PixelCanvas'
import Px from '../components/Px'
import Dust from './Dust'
import { contra, invaders, pacman, plumber, tetris, racing } from '../games/hero'
import { continueScreen } from '../games/screens'
import { sfx, setMuted } from '../lib/audio'
import { bus, store, useStore, reducedMotion } from '../lib/store'
import { pointer } from '../lib/pointer'
import { profile } from '../data/content'

const Room3D = lazy(() => import('./Room3D'))
class Safe extends Component { state = { e: false }; static getDerivedStateFromError() { return { e: true } }; render() { return this.state.e ? null : this.props.children } }

// marquee names are editable here
const LEFT = [
  { id: 'contra', title: 'CONTRA', color: '#2fbf6b', make: contra(), pitch: 330, pos: 'o' },
  { id: 'space', title: 'SPACE WAR', color: '#2bb5ff', make: invaders(), pitch: 392, pos: 'm' },
  { id: 'pac', title: 'PAC-MAN', color: '#ffd23d', make: pacman(), pitch: 440, pos: 'f' },
]
const RIGHT = [
  { id: 'mario', title: 'SUPER RUN', color: '#ff5a4d', make: plumber(), pitch: 523, pos: 'o' },
  { id: 'tetris', title: 'BLOCKS', color: '#a05cff', make: tetris(), pitch: 494, pos: 'm' },
  { id: 'race', title: 'TURBO', color: '#ff9f5a', make: racing(), pitch: 370, pos: 'f' },
]
const SMILE = ['.yyyyy.', 'yyyyyyy', 'yykyyky', 'yyyyyyy', 'ykyyyky', '.ykkky.', '..yyy..']
const HEART = ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

function SideCab({ cfg, side }) {
  const [lit, setLit] = useState(false)
  const [taken, setTaken] = useState(false)
  const tm = useRef()
  const take = () => {
    setTaken(true); sfx.coin(); document.body.classList.add('taken'); clearTimeout(tm.current)
    tm.current = setTimeout(() => { setTaken(false); document.body.classList.remove('taken') }, 2200)
  }
  useEffect(() => () => { clearTimeout(tm.current); document.body.classList.remove('taken') }, [])
  const on = lit || taken
  return (
    <div className={`cab-side ${cfg.pos} ${side}`} style={{ '--c': cfg.color }} onPointerEnter={() => { setLit(true); sfx.hover(cfg.pitch) }} onPointerLeave={() => setLit(false)} onPointerDown={take}>
      <div className={`marquee ${on ? 'lit' : ''}`}>{cfg.title}</div>
      <div className="cab-body">
        <div className={`cab-screen ${taken ? 'taken' : ''}`}>
          <PixelCanvas w={72} h={72} make={cfg.make} lit={on} play={taken} dim={!on} label={`${cfg.title} cabinet: live mini-game that follows your cursor`} />
          {taken && <span className="p1">P1 · YOU</span>}
        </div>
        <div className="cab-panel"><i className="mini-stick" /><i className="mini-btn" style={{ background: '#ff3d8b' }} /><i className="mini-btn" style={{ background: '#ffe34d' }} /></div>
      </div>
      <div className="cab-base" />
    </div>
  )
}

function Lamp({ x, len }) {
  const [hit, setHit] = useState(false)
  const tm = useRef()
  return (
    <div className="lamp-wrap" style={{ left: x + '%' }} onPointerEnter={() => { setHit(true); sfx.hover(660); clearTimeout(tm.current); tm.current = setTimeout(() => setHit(false), 1300) }}>
      <div className={`lamp ${hit ? 'hit' : ''}`} style={{ '--len': len }}>
        <i className="cord" /><i className="shade" /><i className="bulb" />
      </div>
    </div>
  )
}

export default function ArcadeRoom({ onChosen, onSkip }) {
  const root = useRef(null), scene = useRef(null), screenBox = useRef(null)
  const [sel, setSel] = useState(0), [coined, setCoined] = useState(false), [mode, setMode] = useState('menu'), [count, setCount] = useState(3)
  const [zoomStyle, setZoomStyle] = useState(null), [coinDrop, setCoinDrop] = useState(false), [toast, setToast] = useState(null)
  const [pressed, setPressed] = useState(-1)
  const muted = useStore((s) => s.muted)
  const busy = useRef(false), frozen = useRef(false), selRef = useRef(0), buf = useRef([])
  selRef.current = sel
  const reduced = reducedMotion()

  // sizing unit + parallax + joystick tilt (no React re-renders)
  useEffect(() => {
    const el = root.current
    const size = () => {
      const portrait = innerWidth < 760 || innerWidth < innerHeight * 0.8
      const u = portrait ? Math.min(innerWidth / 500, innerHeight / 860) : Math.min(innerWidth / 1440, innerHeight / 860)
      el.style.setProperty('--u', Math.max(u, 0.3).toFixed(4) + 'px')
      el.classList.toggle('portrait', portrait)
    }
    size(); addEventListener('resize', size)
    const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 }
    const mv = (e) => { tgt.x = (e.clientX / innerWidth - 0.5) * 2; tgt.y = (e.clientY / innerHeight - 0.5) * 2 }
    addEventListener('pointermove', mv, { passive: true })
    let raf
    const joys = () => el.querySelectorAll('.joy')
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (frozen.current) return
      cur.x += (tgt.x - cur.x) * 0.08; cur.y += (tgt.y - cur.y) * 0.08
      el.style.setProperty('--px', cur.x.toFixed(3)); el.style.setProperty('--py', cur.y.toFixed(3))
      joys().forEach((j) => {
        const r = j.getBoundingClientRect()
        const dx = Math.max(-1, Math.min(1, (pointer.x - (r.left + r.width / 2)) / (innerWidth * 0.4)))
        j.style.setProperty('--jr', (dx * 26).toFixed(1) + 'deg')
      })
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', mv) }
  }, [])

  const doZoom = useCallback(() => {
    frozen.current = true
    const r = screenBox.current.getBoundingClientRect(), vw = innerWidth, vh = innerHeight
    const s = Math.max(vw / r.width, vh / r.height) * 1.05
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    setZoomStyle({ transform: `translate(${vw / 2 - cx * s}px, ${vh / 2 - cy * s}px) scale(${s})`, transition: reduced ? 'none' : 'transform 1.25s cubic-bezier(.65,.02,.2,1)' })
    setTimeout(onChosen, reduced ? 30 : 1350)
  }, [onChosen, reduced])

  const choose = useCallback((i) => {
    if (busy.current) return
    busy.current = true
    sfx.click()
    if (i === 0) { setSel(0); setMode('yes'); sfx.coin(); doZoom() }
    else {
      setSel(1); setMode('no'); setCount(3); sfx.pop()
      let c = 3
      const iv = setInterval(() => { c--; if (c <= 0) { clearInterval(iv); setMode('yes'); sfx.coin(); doZoom() } else { setCount(c); sfx.beep(440) } }, 800)
    }
  }, [doZoom])

  const insertCoin = useCallback(() => {
    if (busy.current) return
    sfx.coin(); setCoinDrop(true); setTimeout(() => setCoinDrop(false), 700); setCoined(true); setSel(0)
  }, [])

  // keyboard: arrows + Enter, C = coin, Konami
  useEffect(() => {
    const kd = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      buf.current = [...buf.current, k].slice(-10)
      if (buf.current.join() === KONAMI.join()) {
        bus.emit('confetti', { x: innerWidth / 2, y: innerHeight / 2, n: 220 }); store.addScore(3000); sfx.win()
        setToast('KONAMI! +3000'); setTimeout(() => setToast(null), 2200); buf.current = []
      }
      if (busy.current) return
      if (k === 'ArrowLeft' || k === 'ArrowUp') { setSel(0); sfx.hover(520); e.preventDefault() }
      else if (k === 'ArrowRight' || k === 'ArrowDown') { setSel(1); sfx.hover(520); e.preventDefault() }
      else if (k === 'Enter') { choose(selRef.current); e.preventDefault() }
      else if (k === 'c') insertCoin()
    }
    addEventListener('keydown', kd)
    return () => removeEventListener('keydown', kd)
  }, [choose, insertCoin])

  const press = (i) => { setPressed(i); sfx.beep(380 + i * 110); setTimeout(() => setPressed(-1), 140) }
  const makeScreen = useRef(continueScreen).current

  return (
    <div className="room" ref={root} role="region" aria-label="Arcade room intro">
      <div className="room-scene" ref={scene} style={zoomStyle || undefined}>
        <div className="layer wall" />
        <div className="layer sun-wrap" style={{ '--d': 6 }}><div className="sun" /></div>
        <div className="layer r3d" style={{ opacity: zoomStyle ? 0 : 1 }}><Safe><Suspense fallback={null}><Room3D /></Suspense></Safe></div>
        <div className="layer floor" />
        <div className="layer lamps" style={{ '--d': 10 }}>
          {[[9, 70], [23, 110], [37, 60], [63, 60], [77, 110], [91, 70]].map(([x, l], i) => <Lamp key={i} x={x} len={l} />)}
        </div>
        <div className="layer row left" style={{ '--d': 16 }}>{LEFT.map((c) => <SideCab key={c.id} cfg={c} side="L" />)}</div>
        <div className="layer row right" style={{ '--d': 16 }}>{RIGHT.map((c) => <SideCab key={c.id} cfg={c} side="R" />)}</div>

        {/* ───── centre cabinet ───── */}
        <div className="layer centre" style={{ '--d': 24 }}>
          <div className="cab-center">
            <div className="c-marquee">
              <div className="grid-marquee"><span>{profile.arcadeTitle}</span></div>
              <div className="faces">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => <Px key={i} rows={i % 2 ? HEART : SMILE} pal={{ y: '#ffe34d', k: '#0b1020', r: '#ff3d8b' }} s={1} style={{ width: 'calc(var(--u) * 20)', height: 'calc(var(--u) * 20)' }} />)}
              </div>
            </div>
            <div className="c-body">
              <div className="c-bezel">
                <div className="c-screen" ref={screenBox}>
                  <PixelCanvas w={192} h={144} make={makeScreen} sel={sel} mode={mode} count={count} coined={coined} lit
                    onChoose={choose} onHover={(i) => { if (!busy.current) { setSel(i); sfx.hover(520) } }}
                    label="Continue? screen. Choose YES to enter the portfolio or NO." />
                </div>
              </div>
              <div className="c-panel">
                <div className="joy"><div className="tilt"><i className="stick" /><i className="ball" /></div></div>
                <div className="btns">
                  {['#ff3d8b', '#ffe34d', '#2bb5ff', '#35ff7a'].map((c, i) => (
                    <button key={i} tabIndex={-1} aria-hidden="true" className={`arc-btn ${pressed === i ? 'down' : ''}`} style={{ '--b': c }} onPointerDown={() => press(i)} />
                  ))}
                </div>
                <div className="joy"><div className="tilt"><i className="stick" /><i className="ball" /></div></div>
              </div>
              <button className={`coin-panel ${coined ? 'on' : ''}`} onClick={insertCoin} aria-label="Insert coin">
                <span className="slot"><i className={coinDrop ? 'drop' : ''} /></span>
                <span className="coin-txt">INSERT COIN</span>
              </button>
            </div>
            <div className="c-base" />
          </div>
        </div>
        <Dust />
      </div>

      {/* ───── UI over the room ───── */}
      <div className="room-ui">
        <button className="pix-btn small" onClick={onSkip}>SKIP INTRO &gt;</button>
        <button className="pix-btn small" onClick={() => setMuted(!muted)} aria-pressed={!muted} aria-label={muted ? 'Unmute sound' : 'Mute sound'}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button>
      </div>
      <p className="room-hint">MOVE · CLICK · ←/→ + ENTER · PRESS “C” TO INSERT COIN</p>
      {toast && <div className="toast">{toast}</div>}
      <div className="sr-only">
        <button onClick={() => choose(0)}>Yes: enter the portfolio</button>
        <button onClick={() => choose(1)}>No</button>
      </div>
    </div>
  )
}
