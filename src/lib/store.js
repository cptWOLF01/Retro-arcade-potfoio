import { useSyncExternalStore } from 'react'

let state = { score: 0, hearts: 3, muted: true, world: 0, progress: 0 }
const subs = new Set()
const emit = () => subs.forEach((f) => f())

export const store = {
  get: () => state,
  set(p) { state = { ...state, ...p }; emit() },
  addScore(n) { state = { ...state, score: state.score + n }; emit() },
  sub(f) { subs.add(f); return () => subs.delete(f) },
}
export const useStore = (sel) => useSyncExternalStore(store.sub, () => sel(state))

// tiny event bus on window
export const bus = {
  emit: (name, detail) => window.dispatchEvent(new CustomEvent('arcade:' + name, { detail })),
  on: (name, fn) => {
    const h = (e) => fn(e.detail)
    window.addEventListener('arcade:' + name, h)
    return () => window.removeEventListener('arcade:' + name, h)
  },
}
export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
