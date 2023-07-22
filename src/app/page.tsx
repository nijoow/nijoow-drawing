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
import Polygon from '@/components/Drawings/Polygon'
import { getInformationFromVertexs } from '@/utils/getInformationFromVertex'
import Path from '@/components/Drawings/Path'

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

  const [vertexs, setVertexs] = useState<
    { x: number; y: number; id: string }[]
  >([])

  const selectedDrawing = useRecoilValue(selectedDrawingState)

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!selectedDrawingId && event.target instanceof SVGElement) {
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
      setMode({ type: 'SELECT', subType: null })
    }

    setPoint(defaultPoint)
  }

  useEffect(() => {
    if (mode.type !== 'VERTEX') {
      setVertexs([])
    }
  }, [mode])
  console.log(mode.type)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    console.log(event.key, mode.type)
    if (mode.type === 'VERTEX') {
      if (event.key === 'Escape') {
        setVertexs([])
        // setMode({ type: 'SELECT', subType: null })
      }
      if (event.key === 'Enter') {
        console.log('!!')
        const { width, height, center } = getInformationFromVertexs(vertexs)
        setDrawings([
          ...drawings,
          {
            id: uuid(),
            type: 'PATH',
            subType: 'PATH',
            vertexs: vertexs,
            width,
            height,
            center,
            fill: currentOptions.fill,
            stroke: currentOptions.stroke,
            strokeWidth: currentOptions.strokeWidth,
            opacity: currentOptions.opacity,
          },
        ])
        setVertexs([])
      }
    }
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
  }

  console.log(drawings)
  return (
    <main className="w-full h-full" onContextMenu={handleContextMenu}>
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
            case 'POLYGON':
              return <Polygon key={drawing.id} drawing={drawing} />
            case 'PATH':
              return <Path key={drawing.id} drawing={drawing} />
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
      {mode.type === 'VERTEX' && (
        <svg
          viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
          width={window.innerWidth}
          height={window.innerHeight}
          tabIndex={0}
          onMouseDown={(event) => {
            if (event.buttons === 2) {
              setMode({ type: 'SELECT', subType: null })
              return
            }
            setVertexs([
              { x: event.clientX, y: event.clientY, id: uuid() },
              ...vertexs,
            ])
          }}
          onKeyDown={handleKeyDown}
          className="absolute top-0 left-0"
        >
          {vertexs.length > 1 && (
            <path
              d={vertexs
                .map((vertex, index) => {
                  if (index === 0) {
                    return `M${vertex.x} ${vertex.y}`
                  } else {
                    return `L${vertex.x} ${vertex.y}`
                  }
                })
                .join(' ')}
              fill={currentOptions.fill}
              stroke={currentOptions.stroke}
              strokeWidth={currentOptions.strokeWidth}
              opacity={currentOptions.opacity}
              strokeLinejoin="round"
            />
          )}
          {vertexs.length > 1 && (
            <path
              d={vertexs
                .map((vertex, index) => {
                  if (index === 0) {
                    return `M${vertex.x} ${vertex.y}`
                  } else {
                    return `L${vertex.x} ${vertex.y}`
                  }
                })
                .join(' ')}
              className="stroke-blue-400"
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          )}
          {vertexs.map((vertex, index) => (
            <circle
              key={vertex.id}
              id={vertex.id}
              cx={vertex.x}
              cy={vertex.y}
              r="4"
              fill={'white'}
              strokeWidth={2}
              className={`${
                index === vertexs.length - 1
                  ? 'stroke-red-400'
                  : 'stroke-blue-400'
              }`}
              style={{ cursor: 'pointer' }}
              onMouseDown={(event) => {
                event.stopPropagation()
                if (index === vertexs.length - 1) {
                  const { width, height, center } =
                    getInformationFromVertexs(vertexs)
                  setDrawings([
                    ...drawings,
                    {
                      id: uuid(),
                      type: 'SHAPE',
                      subType: 'POLYGON',
                      vertexs: vertexs,
                      width,
                      height,
                      center,
                      fill: currentOptions.fill,
                      stroke: currentOptions.stroke,
                      strokeWidth: currentOptions.strokeWidth,
                      opacity: currentOptions.opacity,
                    },
                  ])
                  setMode({ type: 'SELECT', subType: null })
                  setVertexs([])
                }
              }}
            />
          ))}
        </svg>
      )}
      {selectedDrawing && <Handler />}
    </main>
  )
}
