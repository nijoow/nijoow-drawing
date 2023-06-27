'use client'

import React, { useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { modeAtom } from '@/recoil/atoms'
import SideToolBar from '@/components/ToolBar/SideToolBar'
import { Point } from '@/types/type'
import { v4 as uuid } from 'uuid'
import {
  getHeightFromPoint,
  getLeftFromPoint,
  getTopFromPoint,
  getWidthFromPoint,
} from '@/utils/getValueFromPoint'
import Rectangle from '@/components/Drawings/Rectangle'
import Ellipse from '@/components/Drawings/Ellipse'
import Triangle from '@/components/Drawings/Triangle'
import TopToolBar from '@/components/ToolBar/TopToolBar'

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
}

export default function Home() {
  const [mode, setMode] = useRecoilState(modeAtom)
  const [drawings, setDrawings] = useState<any[]>([])
  const isDragged = useRef(false)
  const [point, setPoint] = useState<Point>(defaultPoint)

  const handleMouseDown = (event: React.MouseEvent) => {
    isDragged.current = true
    setPoint({ ...point, startX: event.clientX, startY: event.clientY })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragged.current) return
    setPoint({
      ...point,
      endX: event.clientX,
      endY: event.clientY,
    })
  }

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isDragged.current) return

    isDragged.current = false
    if (
      mode.type === 'SHAPE' &&
      point.startX &&
      point.startY &&
      point.endX &&
      point.endY
    ) {
      const centerX = (point.startX + point.endX) / 2
      const centerY = (point.startY + point.endY) / 2
      const width = Math.abs(point.endX - point.startX)
      const height = Math.abs(point.endY - point.startY)

      setDrawings([
        ...drawings,
        {
          id: uuid(),
          type: mode.type,
          subType: mode.subType,
          center: { x: centerX, y: centerY },
          width,
          height,
        },
      ])
    }

    setPoint(defaultPoint)
    setMode({ type: null, subType: null })
  }

  return (
    <main className="w-full h-full">
      <TopToolBar />
      <SideToolBar />
      <div
        className="z-0 w-full h-full bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {drawings.map((drawing: any) => {
          switch (drawing.subType) {
            case 'RECTANGLE':
              return <Rectangle key={drawing.id} drawing={drawing} />
            case 'TRIANGLE':
              return <Triangle key={drawing.id} drawing={drawing} />
            case 'ELLIPSE':
              return <Ellipse key={drawing.id} drawing={drawing} />
            default:
              break
          }
        })}
      </div>
      {isDragged.current && (
        <div
          className="absolute border border-blue-500"
          style={{
            left: getLeftFromPoint(point),
            top: getTopFromPoint(point),
            width: getWidthFromPoint(point),
            height: getHeightFromPoint(point),
            pointerEvents: 'none',
          }}
        ></div>
      )}
    </main>
  )
}
