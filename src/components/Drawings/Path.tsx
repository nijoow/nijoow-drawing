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
      className={`absolute`}
      style={{
        left,
        top,
        rotate: `${drawing.rotate}deg`,
      }}
    >
      <path
        id={drawing.id}
        d={drawing.vertexs
          .map(
            (vertex) =>
              ({
                M: `M ${vertex.x} ${vertex.y}`,
                L: `L ${vertex.x} ${vertex.y}`,
                C: `C ${vertex.x1} ${vertex.y1}, ${vertex.x2} ${vertex.y2}, ${vertex.x} ${vertex.y}`,
                S: `S ${vertex.x2} ${vertex.y2}, ${vertex.x} ${vertex.y}`,
                Z: `Z`,
              }[vertex.type!]),
          )
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
