import { useEffect, useState } from 'react'
import ArcadeRoom from './hero/ArcadeRoom'
import Loading from './hero/Loading'
import Dissolve from './hero/Dissolve'
import Site from './Site'
import Confetti from './components/Confetti'
import { reducedMotion } from './lib/store'

// phases: room → loading → dissolve → open   (PLAY AGAIN goes back to room)
export default function App() {
  const [phase, setPhase] = useState('room')
  const [fast, setFast] = useState(false)

  useEffect(() => { document.body.classList.toggle('locked', phase === 'room' || phase === 'loading') }, [phase])

  const skip = () => { setFast(true); setPhase('dissolve') }
  const replay = () => {
    window.__lenis?.scrollTo(0, { immediate: true }); window.scrollTo(0, 0)
    setFast(false); setPhase('room')
  }
  const site = phase === 'dissolve' || phase === 'open'

  return (
    <>
      {site && <Site onReplay={replay} />}
      {(phase === 'room' || phase === 'loading') && <ArcadeRoom key="room" onChosen={() => setPhase('loading')} onSkip={skip} />}
      {phase === 'loading' && <Loading onDone={() => setPhase('dissolve')} onSkip={skip} />}
      {phase === 'dissolve' && <Dissolve fast={fast || reducedMotion()} onDone={() => setPhase('open')} />}
      <Confetti />
    </>
  )
}
