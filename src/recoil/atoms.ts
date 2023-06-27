import { Mode, Options } from '@/types/type'
import { atom } from 'recoil'

export const modeAtom = atom<Mode>({
  key: 'Mode',
  default: { type: 'SELECT', subType: null },
})

export const currentOptionsAtom = atom<Options>({
  key: 'CurrentOptions',
  default: { fill: '#000000', stroke: '#000000', strokeWidth: 1, opacity: 1 },
})
