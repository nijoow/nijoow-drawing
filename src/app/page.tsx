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
import { getHeightFromPoint, getLeftFromPoint, getTopFromPoint, getWidthFromPoint } from '@/utils/getValueFromPoint'
import TopToolBar from '@/components/ToolBar/TopToolBar'
import Handler from '@/components/Handler/Handler'
import { getInformationFromVertexs } from '@/utils/getInformationFromVertex'
import Path from '@/components/Drawings/Path'
import VertexHandler from '@/components/Handler/VertexHandler'
import { bezierCommand, getSvgInformationFromPath } from '@/utils/getInformationFromSplinePaths'
import Spline from '@/components/Drawings/Spline'

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
}

const dragBoxVisibleMode: Array<ModeType | null> = ['SELECT', 'SHAPE', 'VERTEX', 'TEXT']

export default function Home() {
  //recoil
  const [mode, setMode] = useRecoilState(modeAtom)
  const currentOptions = useRecoilValue(currentOptionsState)
  const [, setSelectedDrawingId] = useRecoilState(selectedDrawingIdAtom)
  const [drawings, setDrawings] = useRecoilState(drawingsAtom)
  const selectedDrawing = useRecoilValue(selectedDrawingState)

  //useState
  const [point, setPoint] = useState<Point>(defaultPoint)
  const [vertexs, setVertexs] = useState<Vertex[]>([])
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
    if (mode.type === 'SHAPE' && mode.subType && point.startX && point.startY && point.endX && point.endY) {
      const centerX = (point.startX + point.endX) / 2
      const centerY = (point.startY + point.endY) / 2
      const width = Math.abs(point.endX - point.startX)
      const height = Math.abs(point.endY - point.startY)
      const shapeVertexs: { [key: string]: Vertex[] } = {
        RECTANGLE: [
          { type: 'M', x: point.startX, y: point.startY, id: uuid() },
          { type: 'L', x: point.startX, y: point.endY, id: uuid() },
          { type: 'L', x: point.endX, y: point.endY, id: uuid() },
          { type: 'L', x: point.endX, y: point.startY, id: uuid() },
          { type: 'Z', x: point.startX, y: point.startY, id: uuid() },
        ],
        TRIANGLE: [
          { type: 'M', x: centerX, y: point.startY, id: uuid() },
          { type: 'L', x: point.startX, y: point.endY, id: uuid() },
          { type: 'L', x: point.endX, y: point.endY, id: uuid() },
          { type: 'Z', x: centerX, y: point.startY, id: uuid() },
        ],
        ELLIPSE: [
          { type: 'M', x: centerX, y: point.startY, id: uuid() },
          {
            type: 'C',
            x1: point.startX + width / 4,
            y1: point.startY,
            x2: point.startX,
            y2: point.startY + height / 4,
            x: point.startX,
            y: centerY,
            id: uuid(),
          },
          {
            type: 'S',
            x2: point.startX + width / 4,
            y2: point.endY,
            x: centerX,
            y: point.endY,
            id: uuid(),
          },
          {
            type: 'S',
            x2: point.endX,
            y2: point.endY - height / 4,
            x: point.endX,
            y: centerY,
            id: uuid(),
          },
          {
            type: 'S',
            x2: point.endX - width / 4,
            y2: point.startY,
            x: centerX,
            y: point.startY,
            id: uuid(),
          },
          { type: 'Z', x: centerX, y: point.startY, id: uuid() },
        ],
      }
      const drawingType: { [key: string]: DrawingType } = {
        RECTANGLE: 'POLYGON',
        TRIANGLE: 'POLYGON',
        ELLIPSE: 'ELLIPSE',
      }
      const newId = uuid()
      setDrawings([
        ...drawings,
        {
          id: newId,
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
      setMode({ type: 'SELECT', subType: 'SHAPE' })
      setSelectedDrawingId(newId)
    }

    setPoint(defaultPoint)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (mode.type === 'VERTEX') {
      if (event.key === 'Escape') {
        setVertexs([])
        setMode({ type: 'SELECT', subType: 'SHAPE' })
      }
      if (event.key === 'Enter') {
        addDrawingByVertexs('PATH')
      }
    }
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
  }

  const handleMouseDownSvg = (event: React.MouseEvent) => {
    if (event.buttons === 2) {
      return setMode({ type: 'SELECT', subType: null })
    }
    setVertexs([...vertexs, { type: vertexs.length === 0 ? 'M' : 'L', x: event.clientX, y: event.clientY, id: uuid() }])
  }

  const handleMouseDownVertex = (event: React.MouseEvent, index: number) => {
    event.stopPropagation()
    if (index === 0) {
      addDrawingByVertexs('POLYGON')
    }
  }

  const addDrawingByVertexs = (type: 'PATH' | 'POLYGON') => {
    const { width, height, center } = getInformationFromVertexs(vertexs)
    const newId = uuid()

    setDrawings([
      ...drawings,
      {
        id: newId,
        type,
        subType: null,
        vertexs: {
          PATH: vertexs,
          POLYGON: [...vertexs, { type: 'Z', x: vertexs[0].x, y: vertexs[0].y, id: uuid() } as Vertex],
        }[type],
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
    setMode({ type: 'SELECT', subType: 'SHAPE' })
    setSelectedDrawingId(newId)
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
            case 'PATH':
            case 'ELLIPSE':
              return <Path key={drawing.id} drawing={drawing} />
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
                .map(
                  (vertex, index) =>
                    ({
                      M: `M ${vertex.x} ${vertex.y}`,
                      L: `L ${vertex.x} ${vertex.y}`,
                      C: `C ${vertex.x1} ${vertex.y1}, ${vertex.x2} ${vertex.y2}, ${vertex.x} ${vertex.y}`,
                      S: `S ${vertex.x2} ${vertex.y2}, ${vertex.x} ${vertex.y}`,
                      Z: `Z`,
                    }[vertex.type!]),
                )
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
                    return `M ${vertex.x} ${vertex.y}`
                  } else {
                    return `L ${vertex.x} ${vertex.y}`
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
              className={`${index === 0 ? 'stroke-red-400' : 'stroke-blue-400'}`}
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
            setSpline([{ type: null, x: event.clientX, y: event.clientY, id: uuid() }])
          }}
          onMouseMove={(event) => {
            if (!isDragged.current) return
            setSpline((spline) => [...spline, { type: null, x: event.clientX, y: event.clientY, id: uuid() }])
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
              (acc, point, i, a) => (i === 0 ? `M ${point.x},${point.y}` : `${acc} ${bezierCommand(point, i, a)}`),
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
