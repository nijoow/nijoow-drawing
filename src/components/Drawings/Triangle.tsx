import React from 'react'

const Triangle = ({ drawing }: { drawing: any }) => {
  return (
    <svg
      key={drawing.id}
      viewBox={`0 0 ${drawing.width} ${drawing.height}`}
      width={drawing.width}
      height={drawing.height}
      style={{
        left: drawing.center.x - drawing.width / 2,
        top: drawing.center.y - drawing.height / 2,
        position: 'absolute',
      }}
    >
      <polygon
        points={`${drawing.width / 2},0 0,${drawing.height} ${drawing.width},${
          drawing.height
        }`}
        fill={drawing.fill}
        stroke={drawing.stroke}
        strokeWidth={drawing.strokeWidth}
      />
    </svg>
  )
}

export default Triangle
