import { drawingsAtom, selectedDrawingIdAtom, selectedDrawingState } from '@/recoil/atoms'
import { Vertex } from '@/types/type'
import React, { useEffect, useRef, useState } from 'react'
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
  const [selectedVertexId, setSelectedVertexId] = useState<string | null>(null)

  //constant
  const lastIndex = selectedDrawing.vertexs.length - 1
  const selectedVertex = selectedDrawing.vertexs.find((vertex) => vertex.id === selectedVertexId)

  // useEffect
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
    setSelectedVertexId(vertex.id)

    prevRef.current.vertexs = selectedDrawing.vertexs
    onDrag()
    setStartPoint(event)
  }

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    event.stopPropagation()
    if (!isDragged.current || !point.current.startX || !point.current.startY) return

    const horizontalChange = event.clientX - point.current.startX
    const verticalChange = event.clientY - point.current.startY
    const nextVertexs = prevRef.current.vertexs.map((vertex, index) => {
      if (vertex.id !== selectedVertexId) return vertex

      const newVertex = { ...vertex }
      for (const key in vertex) {
        if (key === 'x' || key === 'currentHandlerX' || key === 'nextHandlerX') {
          newVertex[key] = (vertex[key] as number) + horizontalChange
        } else if (key === 'y' || key === 'currentHandlerY' || key === 'nextHandlerY') {
          newVertex[key] = (vertex[key] as number) + verticalChange
        }
      }
      return newVertex
    })

    const rotatedVertexMinMax = nextVertexs.reduce(
      (acc, vertex) => {
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
    const nextWidth = Math.abs(rotatedVertexMinMax.maxX - rotatedVertexMinMax.minX)
    const nextHeight = Math.abs(rotatedVertexMinMax.maxY - rotatedVertexMinMax.minY)

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
    offDrag()
    resetPoint()
  }

  return (
    <>
      <svg
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        width={window.innerWidth}
        height={window.innerHeight}
        tabIndex={0}
        className="absolute top-0 left-0"
      >
        {selectedDrawing.vertexs.length > 1 && (
          <path
            d={
              `M ${selectedDrawing.vertexs[lastIndex].x} ${selectedDrawing.vertexs[lastIndex].y}` +
              selectedDrawing.vertexs
                .map((vertex, index, vertexs) => {
                  const prevVertex = index === 0 ? selectedDrawing.vertexs[vertexs.length - 1] : vertexs[index - 1]
                  return {
                    M: `M ${vertex.x} ${vertex.y}`,
                    L: `L ${vertex.x} ${vertex.y}`,
                    C: `C ${prevVertex.nextHandlerX} ${prevVertex.nextHandlerY}, ${vertex.currentHandlerX} ${vertex.currentHandlerY}, ${vertex.x} ${vertex.y}`,
                    S: `S ${vertex.currentHandlerX} ${vertex.currentHandlerY}, ${vertex.x} ${vertex.y}`,
                  }[vertex.type!]
                })
                .join(' ') +
              (selectedDrawing.type === 'POLYGON' ? ' Z' : '')
            }
            className="stroke-blue-400"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}

        {selectedVertex?.type === 'C' && (
          <>
            <path
              d={`M ${selectedVertex.x} ${selectedVertex.y} L ${selectedVertex.currentHandlerX} ${selectedVertex.currentHandlerY}`}
              className="stroke-blue-400"
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <path
              d={`M ${selectedVertex.x} ${selectedVertex.y} L ${selectedVertex.nextHandlerX} ${selectedVertex.nextHandlerY}`}
              className="stroke-blue-400"
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <circle
              id={selectedVertex.id}
              cx={selectedVertex.currentHandlerX}
              cy={selectedVertex.currentHandlerY}
              r="4"
              fill={'white'}
              strokeWidth={2}
              className={`stroke-red-400`}
              style={{ cursor: 'pointer' }}
            />
            <circle
              id={selectedVertex.id}
              cx={selectedVertex.nextHandlerX}
              cy={selectedVertex.nextHandlerY}
              r="4"
              fill={'white'}
              strokeWidth={2}
              className={`stroke-red-400`}
              style={{ cursor: 'pointer' }}
            />
          </>
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
              className={`${index === 0 ? 'stroke-red-400' : 'stroke-blue-400'}`}
              style={{ cursor: 'pointer' }}
              onMouseDown={(event) => handleMouseDown(event, vertex)}
            />
          ))}
      </svg>
    </>
  )
}

export default VertexHandler
