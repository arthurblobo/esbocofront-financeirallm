import { useSyncExternalStore } from 'react'

const motionPreference = '(prefers-reduced-motion: reduce)'

function getSnapshot() {
  return window.matchMedia(motionPreference).matches
}

function subscribe(listener: () => void) {
  const media = window.matchMedia(motionPreference)
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
