import React from 'react'
import { useRecoilState } from 'recoil'
import { selectedDrawingIdAtom } from '@/recoil/atoms'

const Triangle = ({ drawing }: { drawing: any }) => {
  const [, setSelectedDrawingId] = useRecoilState(selectedDrawingIdAtom)

  return (
    <svg
      key={drawing.id}
      viewBox={`0 0 ${drawing.width} ${drawing.height}`}
      width={drawing.width}
      height={drawing.height}
      overflow={'visible'}
      className={`absolute`}
      style={{
        left: drawing.center.x - drawing.width / 2,
        top: drawing.center.y - drawing.height / 2,
      }}
      onMouseDown={(e) => {
        setSelectedDrawingId(drawing.id)
      }}
    >
      <polygon
        points={`${drawing.width / 2},0 0,${drawing.height} ${drawing.width},${
          drawing.height
        }`}
        fill={drawing.fill}
        stroke={drawing.stroke}
        strokeWidth={drawing.strokeWidth}
        opacity={drawing.opacity}
      />
    </svg>
  )
}

export default Triangle
