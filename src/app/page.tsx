'use client'

import React, { useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import {
  currentOptionsAtom,
  modeAtom,
  selectedDrawingIdAtom,
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

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
}

export default function Home() {
  const [mode, setMode] = useRecoilState(modeAtom)
  const [currentOptions, setCurrentOptions] = useRecoilState(currentOptionsAtom)
  const [selectedDrawingId, setSelectedDrawingId] = useRecoilState(
    selectedDrawingIdAtom,
  )
  const [drawings, setDrawings] = useState<any[]>([])
  const isDragged = useRef(false)
  const [point, setPoint] = useState<Point>(defaultPoint)

  const selectedDrawing = drawings.find(
    (drawing) => drawing.id === selectedDrawingId,
  )
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.target instanceof SVGElement) {
      setSelectedDrawingId(event.target.id)
    }
    isDragged.current = true
    setPoint({ ...point, startX: event.clientX, startY: event.clientY })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragged.current) return
    if (mode.type === 'SHAPE') {
      setPoint({
        ...point,
        endX: event.clientX,
        endY: event.clientY,
      })
    }
    if (mode.type === 'SELECT' && point.startX && point.startY) {
      const nextX = event.clientX - point.startX
      const nextY = event.clientY - point.startY
      setPoint({
        ...point,
        startX: event.clientX,
        startY: event.clientY,
      })
      setDrawings(
        drawings.map((drawing) =>
          drawing.id === selectedDrawingId
            ? {
                ...drawing,
                center: {
                  x: drawing.center.x + nextX,
                  y: drawing.center.y + nextY,
                },
              }
            : drawing,
        ),
      )
    }
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
      {mode.type === 'SHAPE' && isDragged.current && (
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
      {selectedDrawing && (
        <div
          className="absolute border-2 border-blue-400"
          style={{
            width: selectedDrawing.width,
            height: selectedDrawing.height,
            left: selectedDrawing.center.x - selectedDrawing.width / 2,
            top: selectedDrawing.center.y - selectedDrawing.height / 2,
            pointerEvents: 'none',
          }}
        >
          <div className="left-0 top-0 -translate-x-1/2 -translate-y-1/2 absolute rounded-full w-4 h-4 bg-white border-2 border-blue-400" />
          <div className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 absolute rounded-full w-4 h-4 bg-white border-2 border-blue-400" />
          <div className="left-full top-0 -translate-x-1/2 -translate-y-1/2 absolute rounded-full w-4 h-4 bg-white border-2 border-blue-400" />
          <div className="left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute rounded-full w-4 h-4 bg-white border-2 border-blue-400" />
          <div className="left-full top-1/2 -translate-x-1/2 -translate-y-1/2 absolute rounded-full w-4 h-4 bg-white border-2 border-blue-400" />
          <div className="left-0 top-full -translate-x-1/2 -translate-y-1/2 absolute rounded-full w-4 h-4 bg-white border-2 border-blue-400" />
          <div className="left-1/2 top-full -translate-x-1/2 -translate-y-1/2 absolute rounded-full w-4 h-4 bg-white border-2 border-blue-400" />
          <div className="left-full top-full -translate-x-1/2 -translate-y-1/2 absolute rounded-full w-4 h-4 bg-white border-2 border-blue-400" />
        </div>
      )}
    </main>
  )
}
