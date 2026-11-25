import { useSyncExternalStore } from 'react'

export type PaletteId = 'cyan' | 'amber' | 'crimson' | 'violet' | 'monochrome'

export interface PaletteConfig {
  id: PaletteId
  name: string
  primary: string
  secondary: string
  mid: string
  bgPrimary: string
  bgSecondary: string
  primaryRgb: string
  secondaryRgb: string
}

export const PALETTES: PaletteConfig[] = [
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#00f2fe',
    secondary: '#00ffa3',
    mid: '#38bdf8',
    bgPrimary: '#07090e',
    bgSecondary: '#0d111a',
    primaryRgb: '0, 242, 254',
    secondaryRgb: '0, 255, 163',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    primary: '#ffb703',
    secondary: '#fb8500',
    mid: '#ffd166',
    bgPrimary: '#0b0907',
    bgSecondary: '#16120c',
    primaryRgb: '255, 183, 3',
    secondaryRgb: '251, 133, 0',
  },
  {
    id: 'crimson',
    name: 'Crimson Pulse',
    primary: '#ff2a6d',
    secondary: '#ff758f',
    mid: '#fb7185',
    bgPrimary: '#0b070a',
    bgSecondary: '#170d14',
    primaryRgb: '255, 42, 109',
    secondaryRgb: '255, 117, 143',
  },
  {
    id: 'violet',
    name: 'Ultraviolet',
    primary: '#a855f7',
    secondary: '#38bdf8',
    mid: '#c084fc',
    bgPrimary: '#08070e',
    bgSecondary: '#110e1c',
    primaryRgb: '168, 85, 247',
    secondaryRgb: '56, 189, 248',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    primary: '#f4f4f5',
    secondary: '#a1a1aa',
    mid: '#d4d4d8',
    bgPrimary: '#08090b',
    bgSecondary: '#14161a',
    primaryRgb: '244, 244, 245',
    secondaryRgb: '161, 161, 170',
  },
]

const STORAGE_KEY = 'portfolio-palette'
const listeners = new Set<() => void>()

function readInitialPalette(): PaletteId {
  if (typeof window === 'undefined') return 'cyan'
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as PaletteId | null
    if (saved && PALETTES.some((p) => p.id === saved)) return saved
  } catch {
    // Ignore storage access errors
  }
  return 'cyan'
}

let currentPaletteId: PaletteId = readInitialPalette()

function applyDomPalette(id: PaletteId) {
  if (typeof document === 'undefined') return
  if (id === 'cyan') {
    document.documentElement.removeAttribute('data-palette')
  } else {
    document.documentElement.setAttribute('data-palette', id)
  }
}

applyDomPalette(currentPaletteId)

export function getActivePalette(): PaletteConfig {
  return PALETTES.find((p) => p.id === currentPaletteId) ?? PALETTES[0]
}

export function setActivePalette(id: PaletteId) {
  if (currentPaletteId === id) return
  currentPaletteId = id
  applyDomPalette(id)
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Ignore storage access errors
  }
  listeners.forEach((cb) => cb())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function usePalette(): PaletteConfig {
  const id = useSyncExternalStore(
    subscribe,
    () => currentPaletteId,
    () => 'cyan' as PaletteId
  )
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]
}
