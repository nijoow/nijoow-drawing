import { Drawing } from '@/types/type'
import React from 'react'

const Path = ({ drawing }: { drawing: Drawing }) => {
  const left = drawing.center.x - drawing.width / 2
  const top = drawing.center.y - drawing.height / 2

  const lastIndex = drawing.vertexs.length - 1

  return (
    <svg
      id={drawing.id}
      viewBox={`${left} ${top} ${drawing.width} ${drawing.height}`}
      width={drawing.width}
      height={drawing.height}
      overflow={'visible'}
      className={`absolute`}
      style={{
        left,
        top,
      }}
    >
      <path
        id={drawing.id}
        d={
          `M ${drawing.vertexs[lastIndex].x} ${drawing.vertexs[lastIndex].y} ` +
          drawing.vertexs
            .map((vertex, index, vertexs) => {
              const prevVertex = index === 0 ? vertexs[lastIndex] : vertexs[index - 1]
              return {
                M: `M ${vertex.x} ${vertex.y}`,
                L: `L ${vertex.x} ${vertex.y}`,
                C: `C ${prevVertex.nextHandlerX} ${prevVertex.nextHandlerY}, ${vertex.currentHandlerX} ${vertex.currentHandlerY}, ${vertex.x} ${vertex.y}`,
                S: `S ${vertex.currentHandlerX} ${vertex.currentHandlerY}, ${vertex.x} ${vertex.y}`,
              }[vertex.type!]
            })
            .join(' ') +
          (drawing.type === 'POLYGON' ? ' Z' : '')
        }
        fill={drawing.fill}
        stroke={drawing.stroke}
        strokeWidth={drawing.strokeWidth}
        opacity={drawing.opacity}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Path
