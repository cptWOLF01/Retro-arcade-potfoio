// one shared pointer for every canvas (client coordinates)
export const pointer = { x: -9999, y: -9999, down: false, active: false }
if (typeof window !== 'undefined') {
  const mv = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true }
  window.addEventListener('pointermove', mv, { passive: true })
  window.addEventListener('pointerdown', (e) => { mv(e); pointer.down = true }, { passive: true })
  window.addEventListener('pointerup', () => { pointer.down = false }, { passive: true })
  window.addEventListener('pointercancel', () => { pointer.down = false }, { passive: true })
}
