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
  const transitionType = useRef<'TRANSLATE' | 'RESIZE' | 'ROTATE' | null>(null)
  const selectedDrawing = useRecoilValue(selectedDrawingState)
  const handlerRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef<Direction>(null)
  const rotateRef = useRef<number | null>(null)

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
    handlerRef.current.style.rotate = selectedDrawing?.rotate
  }, [selectedDrawingId])

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation()

    isDragged.current = true
    point.current = {
      ...point.current,
      startX: event.clientX,
      startY: event.clientY,
    }
    if (!handlerRef.current) return
    rotateRef.current = Number(handlerRef.current.style.rotate.slice(0, -3))
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
    const horizontalChange = event.clientX - point.current.startX
    const verticalChange = event.clientY - point.current.startY
    const prevWidth = handlerRef.current.offsetWidth
    const prevHeight = handlerRef.current.offsetHeight
    const prevLeft = handlerRef.current.offsetLeft
    const prevTop = handlerRef.current.offsetTop

    if (transitionType.current === 'TRANSLATE') {
      handlerRef.current.style.left = prevLeft + horizontalChange + 'px'
      handlerRef.current.style.top = prevTop + verticalChange + 'px'
      point.current = {
        ...point.current,
        startX: event.clientX,
        startY: event.clientY,
      }
    } else if (transitionType.current === 'RESIZE') {
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
      point.current = {
        ...point.current,
        startX: event.clientX,
        startY: event.clientY,
      }
    } else if (
      transitionType.current === 'ROTATE' &&
      rotateRef.current !== null
    ) {
      document.body.style.cursor = 'url(/image/cursor/rotate.svg) 12 12, auto'
      const centerX = prevLeft + prevWidth / 2
      const centerY = prevTop + prevHeight / 2
      const initialAngle =
        Math.atan2(
          point.current.startX - centerX,
          point.current.startY - centerY,
        ) *
        (180 / Math.PI)
      const finalAngle =
        Math.atan2(event.clientX - centerX, event.clientY - centerY) *
        (180 / Math.PI)

      const rotate = initialAngle - finalAngle

      handlerRef.current.style.rotate = rotateRef.current + rotate + 'deg'
    }

    const width = handlerRef.current.offsetWidth
    const height = handlerRef.current.offsetHeight
    const center = {
      x: handlerRef.current.offsetLeft + width / 2,
      y: handlerRef.current.offsetTop + height / 2,
    }
    const rotate = handlerRef.current.style.rotate

    setDrawings(
      drawings.map((drawing) =>
        drawing.id === selectedDrawing.id
          ? {
              ...drawing,
              center,
              width,
              height,
              rotate,
            }
          : drawing,
      ),
    )
  }

  const handleMouseUp = (event: React.MouseEvent | MouseEvent): any => {
    event.stopPropagation()
    document.body.style.cursor = 'auto'

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
      className="absolute border-2 border-blue-400 cursor-move pointer-events-auto"
      onMouseDown={(e) => {
        transitionType.current = 'TRANSLATE'
        handleMouseDown(e)
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="absolute top-0 left-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full cursor-nwse-resize "
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'TL'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute top-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-1/2 cursor-ns-resize "
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'T'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute top-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-full cursor-nesw-resize "
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'TR'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute left-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full top-1/2 cursor-ew-resize "
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'L'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-full top-1/2 cursor-ew-resize "
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'R'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute left-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full top-full cursor-nesw-resize "
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'BL'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-1/2 top-full cursor-ns-resize "
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'B'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full left-full top-full cursor-nwse-resize "
        onMouseDown={(e) => {
          transitionType.current = 'RESIZE'
          directionRef.current = 'BR'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-8 h-8 bg-white border-2 border-blue-400 -top-8 -left-8 cursor-rotate"
        onMouseDown={(e) => {
          transitionType.current = 'ROTATE'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-8 h-8 bg-white border-2 border-blue-400 -top-8 -right-8 cursor-rotate"
        onMouseDown={(e) => {
          transitionType.current = 'ROTATE'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-8 h-8 bg-white border-2 border-blue-400 -bottom-8 -left-8 cursor-rotate"
        onMouseDown={(e) => {
          transitionType.current = 'ROTATE'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div
        className="absolute w-8 h-8 bg-white border-2 border-blue-400 -bottom-8 -right-8 cursor-rotate"
        onMouseDown={(e) => {
          transitionType.current = 'ROTATE'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  )
}

export default Handler
