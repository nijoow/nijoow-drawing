export type ModeType = 'SELECT' | 'PENCIL' | 'VERTEX' | 'SHAPE' | 'TEXT'
type ModeSubType = 'SHAPE' | 'VERTEX' | 'RECTANGLE' | 'ELLIPSE' | 'TRIANGLE'
type Option = 'FILL' | 'STROKE' | 'STORKE_WIDTH' | 'OPACITY' | null
export type DrawingType = 'POLYGON' | 'PATH' | 'ELLIPSE' | 'SPLINE' | 'TEXT'
type DrawingSubType = 'POLYGON' | 'RECT' | 'CIRCLE' | 'TEXT' | 'LINE' | 'PATH'

export type Direction = 'TL' | 'T' | 'TR' | 'L' | 'R' | 'BL' | 'B' | 'BR' | null

export interface Mode {
  type: ModeType | null
  subType: ModeSubType | null
}

export interface Options {
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
}

export interface SubToolBar {
  type: ModeType | null
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

interface Center {
  x: number
  y: number
}

export interface Vertex {
  x: number
  y: number
  type: 'M' | 'L' | 'C' | 'S' | null
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  id: string
}

export interface ShapeData {
  width: number | null
  height: number | null
  center: { x: number | null; y: number | null }
  rotate: number | null
  vertexs: Vertex[]
}

export interface Drawing {
  id: string
  type: DrawingType
  subType: null
  vertexs: Vertex[]
  width: number
  height: number
  center: Center
  rotate: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
}
