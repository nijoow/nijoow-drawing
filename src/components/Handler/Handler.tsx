import {
  drawingsAtom,
  selectedDrawingIdAtom,
  selectedDrawingState,
} from '@/recoil/atoms'
import { Point } from '@/types/type'
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

type Direction = 'TL' | 'T' | 'TR' | 'L' | 'R' | 'BL' | 'B' | 'BR' | null

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
}

const Handler = () => {
  const [selectedDrawingId] = useRecoilState(selectedDrawingIdAtom)
  const [drawings, setDrawings] = useRecoilState(drawingsAtom)
  const point = useRef<Point>(defaultPoint)
  const isDragged = useRef(false)
  const transitionType = useRef<'TRANSLATE' | 'RESIZE' | null>(null)
  const selectedDrawing = useRecoilValue(selectedDrawingState)
  const handlerRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef<Direction>(null)

  useEffect(() => {
    if (!handlerRef.current) return
    handlerRef.current.style.width = `${selectedDrawing?.width}px`
    handlerRef.current.style.height = `${selectedDrawing?.height}px`
    handlerRef.current.style.top = `${
      selectedDrawing?.center.y - selectedDrawing?.height / 2
    }px`
    handlerRef.current.style.left = `${
      selectedDrawing?.center.x - selectedDrawing?.width / 2
    }px`
  }, [selectedDrawingId])

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation()

    isDragged.current = true
    point.current = {
      ...point.current,
      startX: event.clientX,
      startY: event.clientY,
    }
  }

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    event.stopPropagation()
    if (
      !isDragged.current ||
      !handlerRef.current ||
      !point.current.startX ||
      !point.current.startY
    )
      return

    if (transitionType.current === 'TRANSLATE') {
      const nextX = event.clientX - point.current.startX
      const nextY = event.clientY - point.current.startY
      handlerRef.current.style.left =
        handlerRef.current.offsetLeft + nextX + 'px'
      handlerRef.current.style.top = handlerRef.current.offsetTop + nextY + 'px'
    }

    if (transitionType.current === 'RESIZE') {
      const horizontalChange = event.clientX - point.current.startX
      const verticalChange = event.clientY - point.current.startY

      const prevWidth = handlerRef.current.offsetWidth
      const prevHeight = handlerRef.current.offsetHeight
      const prevLeft = handlerRef.current.offsetLeft
      const prevTop = handlerRef.current.offsetTop

      switch (directionRef.current) {
        case 'TL':
          handlerRef.current.style.left = prevLeft + horizontalChange + 'px'
          handlerRef.current.style.top = prevTop + verticalChange + 'px'
          handlerRef.current.style.width = prevWidth - horizontalChange + 'px'
          handlerRef.current.style.height = prevHeight - verticalChange + 'px'
          break
        case 'T':
          handlerRef.current.style.top = prevTop + verticalChange + 'px'
          handlerRef.current.style.height = prevHeight - verticalChange + 'px'
          break
        case 'TR':
          handlerRef.current.style.top = prevTop + verticalChange + 'px'
          handlerRef.current.style.width = prevWidth + horizontalChange + 'px'
          handlerRef.current.style.height = prevHeight - verticalChange + 'px'
          break
        case 'L':
          handlerRef.current.style.left = prevLeft + horizontalChange + 'px'
          handlerRef.current.style.width = prevWidth - horizontalChange + 'px'
          break
        case 'R':
          handlerRef.current.style.width = prevWidth + horizontalChange + 'px'
          break
        case 'BL':
          handlerRef.current.style.left = prevLeft + horizontalChange + 'px'
          handlerRef.current.style.width = prevWidth - horizontalChange + 'px'
          handlerRef.current.style.height = prevHeight + verticalChange + 'px'
          break
        case 'B':
          handlerRef.current.style.height = prevHeight + verticalChange + 'px'
          break
        case 'BR':
          handlerRef.current.style.width = prevWidth + horizontalChange + 'px'
          handlerRef.current.style.height = prevHeight + verticalChange + 'px'
          break
        default:
          break
      }
    }
    point.current = {
      ...point.current,
      startX: event.clientX,
      startY: event.clientY,
    }

    const width = handlerRef.current.offsetWidth
    const height = handlerRef.current.offsetHeight
    const center = {
      x: handlerRef.current.offsetLeft + width / 2,
      y: handlerRef.current.offsetTop + height / 2,
    }
    setDrawings(
      drawings.map((drawing) =>
        drawing.id === selectedDrawing.id
          ? {
              ...drawing,
              center,
              width,
              height,
            }
          : drawing,
      ),
    )
  }

  const handleMouseUp = (event: React.MouseEvent | MouseEvent): any => {
    event.stopPropagation()

    isDragged.current = false
    point.current = defaultPoint
    transitionType.current = null
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div
      ref={handlerRef}
      className="absolute border-2 border-blue-400"
      onMouseDown={(e) => {
        transitionType.current = 'TRANSLATE'
        handleMouseDown(e)
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="absolute top-0 left-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full"
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'TL'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute top-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-1/2"
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'T'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute top-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-full"
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'TR'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute left-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full top-1/2"
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'L'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-full top-1/2"
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'R'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute left-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full top-full"
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'BL'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-1/2 top-full"
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'B'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-full top-full"
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'BR'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  )
}

export default Handler
