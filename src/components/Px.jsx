import { useEffect, useRef } from 'react'
import { sprite } from '../lib/gfx'

// Renders a static pixel sprite (array of strings + palette) crisply at scale s.
export default function Px({ rows, pal, s = 3, flip = false, label, className = '', style }) {
  const ref = useRef(null)
  const key = JSON.stringify(pal)
  useEffect(() => {
    const cv = ref.current
    cv.width = rows[0].length; cv.height = rows.length
    const g = cv.getContext('2d')
    g.clearRect(0, 0, cv.width, cv.height)
    sprite(g, rows, pal, 0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, key])
  return (
    <canvas
      ref={ref} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      style={{ width: rows[0].length * s, height: rows.length * s, imageRendering: 'pixelated', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    />
  )
}
