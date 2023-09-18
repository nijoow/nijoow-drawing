import { drawingsAtom, selectedDrawingIdAtom, selectedDrawingState } from '@/recoil/atoms'
import { Vertex } from '@/types/type'
import React, { useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { rotateVertex } from '@/utils/rotateVertex'
import usePointDrag from '@/hooks/usePointDrag'

const VertexHandler = () => {
  // recoil
  const [selectedDrawingId] = useRecoilState(selectedDrawingIdAtom)
  const [, setDrawings] = useRecoilState(drawingsAtom)
  const selectedDrawing = useRecoilValue(selectedDrawingState)

  // custom hooks
  const { point, isDragged, onDrag, offDrag, prevRef, setStartPoint, resetPoint } = usePointDrag()

  if (!selectedDrawing) return null

  // uesRef
  const selectedVertexRef = useRef<Vertex | null>(null)
  const handlerRef = useRef<HTMLDivElement>(null)

  // useEffect
  useEffect(() => {
    if (!handlerRef.current) return
    handlerRef.current.style.width = `${selectedDrawing.width}px`
    handlerRef.current.style.height = `${selectedDrawing.height}px`
    handlerRef.current.style.top = `${selectedDrawing.center.y - selectedDrawing.height / 2}px`
    handlerRef.current.style.left = `${selectedDrawing.center.x - selectedDrawing.width / 2}px`
    handlerRef.current.style.rotate = `${selectedDrawing.rotate}deg`
  }, [selectedDrawingId])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [selectedDrawing])

  // function
  const handleMouseDown = (event: React.MouseEvent, vertex: Vertex) => {
    event.stopPropagation()
    selectedVertexRef.current = vertex

    prevRef.current.vertexs = selectedDrawing.vertexs
    onDrag()
    setStartPoint(event)
  }

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    event.stopPropagation()
    if (
      !isDragged.current ||
      !handlerRef.current ||
      !selectedVertexRef.current ||
      !point.current.startX ||
      !point.current.startY
    )
      return

    const nextVertexX = event.clientX
    const nextVertexY = event.clientY
    const nextVertexs = selectedDrawing.vertexs.map((vertex) =>
      vertex.id === selectedVertexRef.current?.id
        ? { ...vertex, x: nextVertexX, y: nextVertexY }
        : vertex,
    )

    const rotatedVertexMinMax = nextVertexs.reduce(
      (acc, vertex) => {
        if (handlerRef.current === null) return acc
        const rotatedVertex = rotateVertex(
          vertex.x,
          vertex.y,
          selectedDrawing.center.x,
          selectedDrawing.center.y,
          -selectedDrawing.rotate,
        )
        return {
          ...acc,
          minX: Math.min(acc.minX, rotatedVertex.x),
          minY: Math.min(acc.minY, rotatedVertex.y),
          maxX: Math.max(acc.maxX, rotatedVertex.x),
          maxY: Math.max(acc.maxY, rotatedVertex.y),
        }
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    )

    const rotatedVertexCenter = rotateVertex(
      (rotatedVertexMinMax.maxX + rotatedVertexMinMax.minX) / 2,
      (rotatedVertexMinMax.maxY + rotatedVertexMinMax.minY) / 2,
      0,
      0,
      selectedDrawing.rotate,
    )

    const nextCenterX = rotatedVertexCenter.x + selectedDrawing.center.x
    const nextCenterY = rotatedVertexCenter.y + selectedDrawing.center.y
    const nextWidth = Math.abs(
      rotatedVertexMinMax.maxX - rotatedVertexMinMax.minX,
    )
    const nextHeight = Math.abs(
      rotatedVertexMinMax.maxY - rotatedVertexMinMax.minY,
    )

    handlerRef.current.style.width = nextWidth + 'px'
    handlerRef.current.style.height = nextHeight + 'px'
    handlerRef.current.style.left = nextCenterX - nextWidth / 2 + 'px'
    handlerRef.current.style.top = nextCenterY - nextHeight / 2 + 'px'

    setDrawings((drawings) =>
      drawings.map((drawing) =>
        drawing.id === selectedDrawingId
          ? {
              ...drawing,
              width: nextWidth,
              height: nextHeight,
              center: { x: nextCenterX, y: nextCenterY },
              vertexs: nextVertexs,
            }
          : drawing,
      ),
    )
  }

  const handleMouseUp = (event: React.MouseEvent | MouseEvent) => {
    event.stopPropagation()
    document.body.style.cursor = 'auto'
    selectedVertexRef.current = null
    offDrag()
    resetPoint()
  }

  return (
    <>
      <div
        ref={handlerRef}
        className="absolute border-2 border-blue-400 cursor-move pointer-events-auto"
      />
      <svg
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        width={window.innerWidth}
        height={window.innerHeight}
        tabIndex={0}
        className="absolute top-0 left-0"
      >
        {selectedDrawing.vertexs.length > 1 && (
          <path
            d={selectedDrawing.vertexs
              .map((vertex: Vertex, index: number) => {
                if (index === 0) {
                  return `M${vertex.x} ${vertex.y}`
                } else {
                  return `L${vertex.x} ${vertex.y}`
                }
              })
              .join(' ')}
            className="stroke-blue-400"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}
        {selectedDrawing.type !== 'SPLINE' &&
          selectedDrawing.vertexs.map((vertex: Vertex, index: number) => (
            <circle
              key={vertex.id}
              id={vertex.id}
              cx={vertex.x}
              cy={vertex.y}
              r="4"
              fill={'white'}
              strokeWidth={2}
              className={`${
                index === selectedDrawing.vertexs.length - 1
                  ? 'stroke-red-400'
                  : 'stroke-blue-400'
              }`}
              style={{ cursor: 'pointer' }}
              onMouseDown={(event) => handleMouseDown(event, vertex)}
            />
          ))}
      </svg>
    </>
  )
}

export default VertexHandler
