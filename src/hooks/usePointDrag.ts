import { Point, ShapeData } from '@/types/type'
import { useRef } from 'react'

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
}
const defaultPrev = {
  width: null,
  height: null,
  center: { x: null, y: null },
  rotate: null,
  vertexs: [],
}

const usePointDrag = () => {
  const point = useRef<Point>(defaultPoint)
  const isDragged = useRef(false)
  const prevRef = useRef<ShapeData>(defaultPrev)

  const onDrag = () => (isDragged.current = true)

  const offDrag = () => (isDragged.current = false)

  const setStartPoint = (event: React.MouseEvent) =>
    (point.current = {
      startX: event.clientX,
      startY: event.clientY,
      endX: undefined,
      endY: undefined,
    })

  const resetPoint = () => (point.current = defaultPoint)

  const resetPrev = () => (prevRef.current = defaultPrev)

  return {
    point,
    isDragged,
    onDrag,
    offDrag,
    prevRef,
    setStartPoint,
    resetPoint,
    resetPrev,
  }
}

export default usePointDrag
