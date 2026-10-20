import Px from './Px'
import { useStore } from '../lib/store'
import { setMuted } from '../lib/audio'
import { HEART } from '../lib/sprites'
import { profile, worlds } from '../data/content'

export default function Hud() {
  const score = useStore((s) => s.score)
  const world = useStore((s) => s.world)
  const hearts = useStore((s) => s.hearts)
  const muted = useStore((s) => s.muted)
  return (
    <header className="hud" role="banner">
      <div className="hud-row">
        <div className="hud-l">
          <span>{profile.short}</span>
          <span className="hearts" aria-label={`${hearts} lives`}>
            {Array.from({ length: hearts }).map((_, i) => <Px key={i} rows={HEART} pal={{ r: '#ff3d8b' }} s={2} />)}
          </span>
        </div>
        <div className="hud-c" aria-live="polite">{worlds[world]?.hud}</div>
        <div className="hud-r">
          <span aria-label={`Score ${score}`}>SCORE {String(score).padStart(6, '0')}</span>
          <button className="mute" onClick={() => setMuted(!muted)} aria-pressed={!muted} aria-label={muted ? 'Unmute sound' : 'Mute sound'}>{muted ? 'OFF' : 'ON'}</button>
        </div>
      </div>
      <div className="hud-prog" aria-hidden="true"><i /></div>
    </header>
  )
}
