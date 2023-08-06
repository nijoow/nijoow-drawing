import { Drawing, Vertex } from '@/types/type'
import React from 'react'

const Polygon = ({ drawing }: { drawing: Drawing }) => {
  const left = drawing.center.x - drawing.width / 2
  const top = drawing.center.y - drawing.height / 2
  return (
    <svg
      id={drawing.id}
      viewBox={`${left} ${top} ${drawing.width} ${drawing.height}`}
      width={drawing.width}
      height={drawing.height}
      overflow={'visible'}
      className={`absolute `}
      style={{
        left,
        top,
      }}
    >
      <polygon
        id={drawing.id}
        points={drawing.vertexs
          .map((vertex: Vertex) => `${vertex.x} ${vertex.y}`)
          .join(', ')}
        fill={drawing.fill}
        stroke={drawing.stroke}
        strokeWidth={drawing.strokeWidth}
        opacity={drawing.opacity}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Polygon
