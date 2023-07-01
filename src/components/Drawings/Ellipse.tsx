import React from 'react'

const Ellipse = ({ drawing }: { drawing: any }) => {
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
      <ellipse
        id={drawing.id}
        cx={drawing.width / 2}
        cy={drawing.height / 2}
        rx={drawing.width / 2}
        ry={drawing.height / 2}
        fill={drawing.fill}
        stroke={drawing.stroke}
        strokeWidth={drawing.strokeWidth}
      />
    </svg>
  )
}

export default Ellipse
