type ModeType = 'SELECT' | 'PENCIL' | 'VERTEX' | 'SHAPE' | 'TEXT' | null
type Option = 'FILL' | 'STROKE' | 'STORKE_WIDTH' | 'OPACITY' | null
export type Direction = 'TL' | 'T' | 'TR' | 'L' | 'R' | 'BL' | 'B' | 'BR' | null

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

interface Center {
  x: number
  y: number
}

interface Vertex {
  x: number
  y: number
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
  type: 'SHAPE' | 'PATH' | 'TEXT'
  subType: 'POLYGON' | 'RECT' | 'CIRCLE' | 'TEXT' | 'LINE' | 'PATH'
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
