import { useEffect, useRef } from 'react'

// pixel dissolve + CRT flicker: a black screen that disappears block by block
export default function Dissolve({ onDone, fast }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d'), S = 16
    const W = Math.ceil(innerWidth / S), H = Math.ceil(innerHeight / S)
    cv.width = W; cv.height = H; cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px'
    const th = Array.from({ length: W * H }, () => Math.random())
    const dur = fast ? 150 : 700, t0 = performance.now()
    let raf
    const loop = (now) => {
      const p = Math.min(1, (now - t0) / dur)
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
      th.forEach((v, i) => { if (v < p) ctx.clearRect(i % W, (i / W) | 0, 1, 1) })
      if (p < 1) raf = requestAnimationFrame(loop); else onDone()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <canvas ref={ref} className="dissolve crt-flicker" aria-hidden="true" />
}
