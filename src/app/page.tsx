'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  currentOptionsState,
  drawingsAtom,
  modeAtom,
  selectedDrawingIdAtom,
  selectedDrawingState,
} from '@/recoil/atoms'
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
import Handler from '@/components/Handler/Handler'

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
}

export default function Home() {
  const [mode, setMode] = useRecoilState(modeAtom)
  const currentOptions = useRecoilValue(currentOptionsState)
  const [selectedDrawingId, setSelectedDrawingId] = useRecoilState(
    selectedDrawingIdAtom,
  )
  const [drawings, setDrawings] = useRecoilState(drawingsAtom)
  const isDragged = useRef(false)

  const [point, setPoint] = useState<Point>(defaultPoint)

  const selectedDrawing = useRecoilValue(selectedDrawingState)

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (event.target instanceof SVGElement) {
      setSelectedDrawingId(event.target.id)
    } else {
      setSelectedDrawingId(null)
    }
    isDragged.current = true
    setPoint({ ...point, startX: event.clientX, startY: event.clientY })
  }

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    if (!isDragged.current) return
    setPoint({
      ...point,
      endX: event.clientX,
      endY: event.clientY,
    })
  }

  const handleMouseUp = (event: React.MouseEvent | MouseEvent) => {
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
          fill: currentOptions.fill,
          stroke: currentOptions.stroke,
          strokeWidth: currentOptions.strokeWidth,
          opacity: currentOptions.opacity,
        },
      ])
      setMode({ type: null, subType: null })
    }

    setPoint(defaultPoint)
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
        onMouseLeave={handleMouseUp}
      >
        {drawings.map((drawing: any, index: number) => {
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
      {selectedDrawing && <Handler />}
    </main>
  )
}
