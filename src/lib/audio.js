import { store } from './store'

let ac
function ctx() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)() } catch { return null } }
  if (ac.state === 'suspended') ac.resume()
  return ac
}
function tone(freq, dur, type = 'square', vol = 0.05, slide = 0, delay = 0) {
  if (store.get().muted) return
  const c = ctx(); if (!c) return
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + delay
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(c.destination)
  o.start(t); o.stop(t + dur + 0.02)
}

export const sfx = {
  click: () => tone(660, 0.05),
  hover: (f = 440) => tone(f, 0.04, 'square', 0.018),
  beep: (f = 520) => tone(f, 0.08, 'square', 0.05),
  coin: () => { tone(988, 0.07); tone(1319, 0.28, 'square', 0.06, 0, 0.07) },
  jump: () => tone(280, 0.2, 'square', 0.05, 520),
  shoot: () => tone(900, 0.09, 'sawtooth', 0.035, -700),
  pop: () => tone(200, 0.1, 'triangle', 0.06, 300),
  death: () => [494, 466, 440, 415, 392, 370, 349, 330, 311, 294].forEach((f, i) => tone(f, 0.12, 'square', 0.05, 0, i * 0.09)),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.05, 0, i * 0.11)),
  eat: () => tone(380, 0.08, 'triangle', 0.06, 380),
}
export function setMuted(m) {
  store.set({ muted: m })
  if (!m) { ctx(); sfx.beep(880) }
}
