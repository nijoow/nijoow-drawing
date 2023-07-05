import { Mode, Options } from '@/types/type'
import { atom, selector } from 'recoil'

export const modeAtom = atom<Mode>({
  key: 'Mode',
  default: { type: 'SELECT', subType: null },
})

export const currentOptionsAtom = atom<Options>({
  key: 'CurrentOptions',
  default: { fill: '#000000', stroke: '#000000', strokeWidth: 1, opacity: 1 },
})

export const selectedDrawingIdAtom = atom<string | null>({
  key: 'SelectedDrawing',
  default: null,
})

export const drawingsAtom = atom<any[]>({ key: 'Drawings', default: [] })

export const selectedDrawingState = selector({
  key: 'SelectedDrawing',
  get: ({ get }) => {
    const drawings = get(drawingsAtom)
    const selectedDrawingId = get(selectedDrawingIdAtom)

    return drawings.find((drawing) => drawing.id === selectedDrawingId)
  },
})
