import React from 'react'

const Rectangle = ({ drawing }: { drawing: any }) => {
  return (
    <svg
      id={drawing.id}
      viewBox={`0 0 ${drawing.width} ${drawing.height}`}
      width={drawing.width}
      height={drawing.height}
      overflow={'visible'}
      className={`absolute`}
      style={{
        left: drawing.center.x - drawing.width / 2,
        top: drawing.center.y - drawing.height / 2,
      }}
    >
      <rect
        id={drawing.id}
        x={0}
        y={0}
        width={drawing.width}
        height={drawing.height}
        fill={drawing.fill}
        stroke={drawing.stroke}
        strokeWidth={drawing.strokeWidth}
        opacity={drawing.opacity}
      />
    </svg>
  )
}

export default Rectangle
