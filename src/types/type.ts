type ModeType = 'SELECT' | 'PENCIL' | 'VERTEX' | 'SHAPE' | 'TEXT' | null
type Option = 'FILL' | 'STROKE' | 'STORKE_WIDTH' | 'OPACITY' | null

export interface Mode {
  type: ModeType
  subType: string | null
}
export interface Options {
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
}

export interface SubToolBar {
  type: ModeType
}

export interface OptionsToolBar {
  type: Option
}

export interface Point {
  startX: number | undefined
  startY: number | undefined
  endX: number | undefined
  endY: number | undefined
}
