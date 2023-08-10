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
import { Drawing, DrawingType, ModeType, Point, Vertex } from '@/types/type'
import { v4 as uuid } from 'uuid'
import {
  getHeightFromPoint,
  getLeftFromPoint,
  getTopFromPoint,
  getWidthFromPoint,
} from '@/utils/getValueFromPoint'
import Ellipse from '@/components/Drawings/Ellipse'
import TopToolBar from '@/components/ToolBar/TopToolBar'
import Handler from '@/components/Handler/Handler'
import Polygon from '@/components/Drawings/Polygon'
import { getInformationFromVertexs } from '@/utils/getInformationFromVertex'
import Path from '@/components/Drawings/Path'
import VertexHandler from '@/components/Handler/VertexHandler'
import {
  bezierCommand,
  getSvgInformationFromPath,
} from '@/utils/getInformationFromSplinePaths'
import Spline from '@/components/Drawings/Spline'

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
}

const dragBoxVisibleMode: Array<ModeType | null> = [
  'SELECT',
  'SHAPE',
  'VERTEX',
  'TEXT',
]

export default function Home() {
  //recoil
  const [mode, setMode] = useRecoilState(modeAtom)
  const currentOptions = useRecoilValue(currentOptionsState)
  const [, setSelectedDrawingId] = useRecoilState(selectedDrawingIdAtom)
  const [drawings, setDrawings] = useRecoilState(drawingsAtom)
  const selectedDrawing = useRecoilValue(selectedDrawingState)

  //useState
  const [point, setPoint] = useState<Point>(defaultPoint)
  const [vertexs, setVertexs] = useState<
    { x: number; y: number; id: string }[]
  >([])
  const [spline, setSpline] = useState<Vertex[]>([])

  //useRef
  const isDragged = useRef(false)

  // useEffect
  useEffect(() => {
    if (mode.type !== 'VERTEX') {
      setVertexs([])
    }
  }, [mode])

  //function
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!selectedDrawing?.id && event.target instanceof SVGElement) {
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
      mode.subType &&
      point.startX &&
      point.startY &&
      point.endX &&
      point.endY
    ) {
      const centerX = (point.startX + point.endX) / 2
      const centerY = (point.startY + point.endY) / 2
      const width = Math.abs(point.endX - point.startX)
      const height = Math.abs(point.endY - point.startY)
      const shapeVertexs: { [key: string]: Vertex[] } = {
        RECTANGLE: [
          { x: point.startX, y: point.startY, id: uuid() },
          { x: point.startX, y: point.endY, id: uuid() },
          { x: point.endX, y: point.endY, id: uuid() },
          { x: point.endX, y: point.startY, id: uuid() },
        ],
        TRIANGLE: [
          { x: centerX, y: point.startY, id: uuid() },
          { x: point.startX, y: point.endY, id: uuid() },
          { x: point.endX, y: point.endY, id: uuid() },
        ],
        ELLIPSE: [],
      }
      const drawingType: { [key: string]: DrawingType } = {
        RECTANGLE: 'POLYGON',
        TRIANGLE: 'POLYGON',
        ELLIPSE: 'ELLIPSE',
      }
      setDrawings([
        ...drawings,
        {
          id: uuid(),
          type: drawingType[mode.subType],
          subType: null,
          center: { x: centerX, y: centerY },
          width,
          height,
          rotate: 0,
          vertexs: shapeVertexs[mode.subType],
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (mode.type === 'VERTEX') {
      if (event.key === 'Escape') {
        setVertexs([])
        setMode({ type: 'SELECT', subType: null })
      }
      if (event.key === 'Enter') {
        const { width, height, center } = getInformationFromVertexs(vertexs)
        setDrawings([
          ...drawings,
          {
            id: uuid(),
            type: 'PATH',
            subType: null,
            vertexs: vertexs,
            width,
            height,
            center,
            rotate: 0,
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

  const handleMouseDownSvg = (event: React.MouseEvent) => {
    if (event.buttons === 2) {
      setMode({ type: 'SELECT', subType: null })
      return
    }
    setVertexs([{ x: event.clientX, y: event.clientY, id: uuid() }, ...vertexs])
  }

  const handleMouseDownVertex = (event: React.MouseEvent, index: number) => {
    event.stopPropagation()
    if (index === vertexs.length - 1) {
      const { width, height, center } = getInformationFromVertexs(vertexs)
      setDrawings([
        ...drawings,
        {
          id: uuid(),
          type: 'POLYGON',
          subType: null,
          vertexs: vertexs,
          width,
          height,
          center,
          rotate: 0,
          fill: currentOptions.fill,
          stroke: currentOptions.stroke,
          strokeWidth: currentOptions.strokeWidth,
          opacity: currentOptions.opacity,
        },
      ])
      setMode({ type: 'SELECT', subType: null })
      setVertexs([])
    }
  }

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
        {drawings.map((drawing: Drawing, index: number) => {
          switch (drawing.type) {
            case 'POLYGON':
              return <Polygon key={drawing.id} drawing={drawing} />
            case 'PATH':
              return <Path key={drawing.id} drawing={drawing} />
            case 'ELLIPSE':
              return <Ellipse key={drawing.id} drawing={drawing} />
            case 'SPLINE':
              return <Spline key={drawing.id} drawing={drawing} />
            default:
              break
          }
        })}
      </div>
      {isDragged.current && dragBoxVisibleMode.includes(mode.type) && (
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
          onMouseDown={(event) => handleMouseDownSvg(event)}
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
              strokeLinecap="round"
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
              strokeLinecap="round"
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
              onMouseDown={(event) => handleMouseDownVertex(event, index)}
            />
          ))}
        </svg>
      )}
      {mode.type === 'PENCIL' && (
        <svg
          viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
          width={window.innerWidth}
          height={window.innerHeight}
          tabIndex={0}
          onMouseDown={(event) => {
            isDragged.current = true
            setSpline([{ x: event.clientX, y: event.clientY, id: uuid() }])
          }}
          onMouseMove={(event) => {
            if (!isDragged.current) return
            setSpline((spline) => [
              ...spline,
              { x: event.clientX, y: event.clientY, id: uuid() },
            ])
          }}
          onMouseUp={(event) => {
            const { center, width, height } = getSvgInformationFromPath(spline)

            setDrawings((drawings) => [
              ...drawings,
              {
                id: uuid(),
                type: 'SPLINE',
                subType: null,
                vertexs: spline,
                width,
                height,
                center,
                rotate: 0,
                fill: 'none',
                stroke: currentOptions.stroke,
                strokeWidth: currentOptions.strokeWidth,
                opacity: currentOptions.opacity,
              },
            ])
            setSpline([])
            isDragged.current = false
          }}
          onKeyDown={handleKeyDown}
          className="absolute top-0 left-0 cursor-pencil"
        >
          <path
            d={spline.reduce(
              (acc, point, i, a) =>
                i === 0
                  ? `M ${point.x},${point.y}`
                  : `${acc} ${bezierCommand(point, i, a)}`,
              '',
            )}
            fill="none"
            stroke={currentOptions.stroke}
            strokeWidth={currentOptions.strokeWidth}
            opacity={currentOptions.opacity}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
      {selectedDrawing && mode.subType === 'SHAPE' && <Handler />}
      {selectedDrawing && mode.subType === 'VERTEX' && <VertexHandler />}
    </main>
  )
}
