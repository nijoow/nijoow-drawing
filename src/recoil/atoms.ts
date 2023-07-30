import { Drawing, Mode, Options } from '@/types/type'
import { atom, selector } from 'recoil'

export const modeAtom = atom<Mode>({
  key: 'Mode',
  default: { type: 'SELECT', subType: null },
})

export const currentOptionsState = selector({
  key: 'CurrentOptions',
  get: ({ get }) => {
    const selectedDrawing = get(selectedDrawingState)

    return selectedDrawing
      ? {
          fill: selectedDrawing.fill,
          stroke: selectedDrawing.stroke,
          strokeWidth: selectedDrawing.strokeWidth,
          opacity: selectedDrawing.opacity,
        }
      : get(basicOptionsAtom)
  },
})

export const basicOptionsAtom = atom<Options>({
  key: 'BasicOptions',
  default: { fill: '#000000', stroke: '#000000', strokeWidth: 1, opacity: 1 },
})

export const selectedDrawingIdAtom = atom<string | null>({
  key: 'SelectedDrawingId',
  default: null,
})

export const drawingsAtom = atom<Drawing[]>({ key: 'Drawings', default: [] })

export const selectedDrawingState = selector({
  key: 'SelectedDrawing',
  get: ({ get }) => {
    const drawings = get(drawingsAtom)
    const selectedDrawingId = get(selectedDrawingIdAtom)

    return drawings.find((drawing) => drawing.id === selectedDrawingId) ?? null
  },
})
