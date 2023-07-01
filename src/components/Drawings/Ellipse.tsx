import React from 'react'
import { useRecoilState } from 'recoil'
import { selectedDrawingIdAtom } from '@/recoil/atoms'

const Ellipse = ({ drawing }: { drawing: any }) => {
  const [, setSelectedDrawingId] = useRecoilState(selectedDrawingIdAtom)

  return (
    <svg
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
      <ellipse
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
