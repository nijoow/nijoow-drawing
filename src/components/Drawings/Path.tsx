import { Drawing } from '@/types/type'
import React from 'react'

const Path = ({ drawing }: { drawing: Drawing }) => {
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
        rotate: `${drawing.rotate}deg`,
      }}
    >
      <path
        id={drawing.id}
        d={drawing.vertexs
          .map((vertex, index) => {
            if (index === 0) {
              return `M${vertex.x} ${vertex.y}`
            } else {
              return `L${vertex.x} ${vertex.y}`
            }
          })
          .join(' ')}
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
