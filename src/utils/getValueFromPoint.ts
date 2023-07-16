import { Point } from '@/types/type'

export const getWidthFromPoint = (point: Point) => {
  if (point.startX === undefined || point.endX === undefined) return
  return Math.abs(point.endX - point.startX)
}
export const getHeightFromPoint = (point: Point) => {
  if (point.startY === undefined || point.endY === undefined) return
  return Math.abs(point.endY - point.startY)
}
export const getLeftFromPoint = (point: Point) => {
  if (point.startX === undefined || point.endX === undefined) return
  return Math.min(point.startX, point.endX)
}
export const getTopFromPoint = (point: Point) => {
  if (point.startY === undefined || point.endY === undefined) return
  return Math.min(point.startY, point.endY)
}
