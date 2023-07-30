import {
  drawingsAtom,
  selectedDrawingIdAtom,
  selectedDrawingState,
} from '@/recoil/atoms'
import { Direction, Point, ShapeData } from '@/types/type'
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { IoCloseCircleOutline } from 'react-icons/io5'
import { remap } from '@/utils/remap'

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
}

const defaultPrev = {
  width: null,
  height: null,
  center: { x: null, y: null },
  rotate: null,
  vertexs: [],
}

const rotateHandler = [
  { position: '-top-9 -left-9' },
  { position: '-top-9 -right-9' },
  { position: '-bottom-9 -left-9 ' },
  { position: '-bottom-9 -right-9' },
]

const resizeHandler = [
  { position: 'top-0 left-1/2', direction: 'T' },
  { position: 'top-1/2 left-0', direction: 'L' },
  { position: 'top-full left-1/2', direction: 'B' },
  { position: 'top-1/2 left-full', direction: 'R' },
  { position: 'top-0 left-0', direction: 'TL' },
  { position: 'top-0 left-full', direction: 'TR' },
  { position: 'top-full left-0', direction: 'BL' },
  { position: 'top-full left-full', direction: 'BR' },
]

const Handler = () => {
  // recoil
  const [selectedDrawingId] = useRecoilState(selectedDrawingIdAtom)
  const [, setDrawings] = useRecoilState(drawingsAtom)
  const selectedDrawing = useRecoilValue(selectedDrawingState)

  // useState
  const [openItemMenu, setOpenItemMenu] = useState<{
    open: boolean
    x: number | null
    y: number | null
  }>({ open: false, x: null, y: null })

  // uesRef
  const point = useRef<Point>(defaultPoint)
  const isDragged = useRef(false)
  const transitionType = useRef<'TRANSLATE' | 'RESIZE' | 'ROTATE' | null>(null)
  const handlerRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef<Direction>(null)
  const prevRef = useRef<ShapeData>(defaultPrev)

  //useEffect
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
    handlerRef.current.style.rotate = `${selectedDrawing?.rotate}deg`
  }, [selectedDrawingId])

  // function
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation()
    prevRef.current = defaultPrev

    isDragged.current = true
    point.current = {
      startX: event.clientX,
      startY: event.clientY,
      endX: undefined,
      endY: undefined,
    }

    if (!handlerRef.current) return
    prevRef.current.width = handlerRef.current.offsetWidth
    prevRef.current.height = handlerRef.current.offsetHeight
    prevRef.current.center.x =
      handlerRef.current.offsetLeft + prevRef.current.width / 2
    prevRef.current.center.y =
      handlerRef.current.offsetTop + prevRef.current.height / 2
    prevRef.current.rotate = Number(
      handlerRef.current.style.rotate.slice(0, -3),
    )
    prevRef.current.vertexs = selectedDrawing.vertexs
  }

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    event.stopPropagation()
    if (
      !isDragged.current ||
      !handlerRef.current ||
      !point.current.startX ||
      !point.current.startY ||
      prevRef.current.width === null ||
      prevRef.current.height === null ||
      prevRef.current.center.x === null ||
      prevRef.current.center.y === null ||
      prevRef.current.rotate === null
    )
      return

    closeItemMenu()
    const prevLeft = prevRef.current.center.x - prevRef.current.width / 2
    const prevTop = prevRef.current.center.y - prevRef.current.height / 2

    if (transitionType.current === 'TRANSLATE') {
      const horizontalChange = event.clientX - point.current.startX
      const verticalChange = event.clientY - point.current.startY
      const nextLeft = prevLeft + horizontalChange
      const nextTop = prevTop + verticalChange
      const nextCenter = {
        x: prevRef.current.center.x + horizontalChange,
        y: prevRef.current.center.y + verticalChange,
      }
      handlerRef.current.style.left = nextLeft + 'px'
      handlerRef.current.style.top = nextTop + 'px'

      setDrawings((drawings) =>
        drawings.map((drawing) =>
          drawing.id === selectedDrawing.id
            ? {
                ...drawing,
                center: nextCenter,
                vertexs:
                  prevRef.current.vertexs?.map(
                    (vertex: { x: number; y: number; id: string }) => ({
                      ...vertex,
                      x: vertex.x + horizontalChange,
                      y: vertex.y + verticalChange,
                    }),
                  ) || [],
              }
            : drawing,
        ),
      )
    } else if (transitionType.current === 'RESIZE') {
      if (!directionRef.current) return
      const r = -prevRef.current.rotate * (Math.PI / 180)
      const rotatedStartX =
        (point.current.startX - prevRef.current.center.x) * Math.cos(r) -
        (point.current.startY - prevRef.current.center.y) * Math.sin(r)
      const rotatedStartY =
        (point.current.startX - prevRef.current.center.x) * Math.sin(r) +
        (point.current.startY - prevRef.current.center.y) * Math.cos(r)

      const rotatedEndX =
        (event.clientX - prevRef.current.center.x) * Math.cos(r) -
        (event.clientY - prevRef.current.center.y) * Math.sin(r)

      const rotatedEndY =
        (event.clientX - prevRef.current.center.x) * Math.sin(r) +
        (event.clientY - prevRef.current.center.y) * Math.cos(r)

      const setResize = (
        nextWidth: number,
        nextHeight: number,
        nextCenterX: number,
        nextCenterY: number,
      ) => {
        if (!handlerRef.current) return

        const nextVertexs = prevRef.current.vertexs?.map((vertex) =>
          prevRef.current.width && prevRef.current.height
            ? {
                ...vertex,
                x: remap(
                  vertex.x,
                  prevLeft,
                  prevLeft + prevRef.current.width,
                  nextCenterX - nextWidth / 2,
                  nextCenterX + nextWidth / 2,
                ),
                y: remap(
                  vertex.y,
                  prevTop,
                  prevTop + prevRef.current.height,
                  nextCenterY - nextHeight / 2,
                  nextCenterY + nextHeight / 2,
                ),
              }
            : vertex,
        )
        const width = Math.abs(nextWidth)
        const height = Math.abs(nextHeight)

        handlerRef.current.style.width = width + 'px'
        handlerRef.current.style.height = height + 'px'
        handlerRef.current.style.left = nextCenterX - width / 2 + 'px'
        handlerRef.current.style.top = nextCenterY - height / 2 + 'px'

        setDrawings((drawings) =>
          drawings.map((drawing) =>
            drawing.id === selectedDrawing.id
              ? {
                  ...drawing,
                  width: width,
                  height: height,
                  center: { x: nextCenterX, y: nextCenterY },
                  vertexs: nextVertexs,
                }
              : drawing,
          ),
        )
      }
      const deltaX = (rotatedEndX - rotatedStartX) * 2
      const deltaY = (rotatedEndY - rotatedStartY) * 2
      let nextWidth = 0
      let nextHeight = 0
      const nextCenterX =
        (handlerRef.current.getBoundingClientRect().left +
          handlerRef.current.getBoundingClientRect().right) /
        2

      const nextCenterY =
        (handlerRef.current.getBoundingClientRect().top +
          handlerRef.current.getBoundingClientRect().bottom) /
        2

      switch (directionRef.current) {
        case 'TL':
          // 수정 필요
          nextWidth = prevRef.current.width - deltaX
          nextHeight = prevRef.current.height - deltaY
          setResize(nextWidth, nextHeight, nextCenterX, nextCenterY)
          break
        case 'T':
          nextHeight = prevRef.current.height - deltaY
          setResize(
            prevRef.current.width,
            nextHeight,
            prevRef.current.center.x,
            nextCenterY,
          )
          break
        case 'TR':
          nextWidth = prevRef.current.width + deltaX
          nextHeight = prevRef.current.height - deltaY
          setResize(nextWidth, nextHeight, nextCenterX, nextCenterY)
          break
        case 'L':
          nextWidth = prevRef.current.width - deltaX
          setResize(
            nextWidth,
            prevRef.current.height,
            nextCenterX,
            prevRef.current.center.y,
          )
          break
        case 'R':
          nextWidth = prevRef.current.width + deltaX
          setResize(
            nextWidth,
            prevRef.current.height,
            nextCenterX,
            prevRef.current.center.y,
          )
          break
        case 'BL':
          nextWidth = prevRef.current.width - deltaX
          nextHeight = prevRef.current.height + deltaY
          setResize(nextWidth, nextHeight, nextCenterX, nextCenterY)
          break
        case 'B':
          nextHeight = prevRef.current.height + deltaY
          setResize(
            prevRef.current.width,
            nextHeight,
            prevRef.current.center.x,
            nextCenterY,
          )
          break
        case 'BR':
          nextWidth = prevRef.current.width + deltaX
          nextHeight = prevRef.current.height + deltaY
          setResize(nextWidth, nextHeight, nextCenterX, nextCenterY)
          break
        default:
          break
      }
    } else if (
      transitionType.current === 'ROTATE' &&
      prevRef.current.rotate !== null
    ) {
      document.body.style.cursor = 'url(/image/cursor/rotate.svg) 12 12, auto'
      const initialAngle =
        Math.atan2(
          point.current.startX - prevRef.current.center.x,
          point.current.startY - prevRef.current.center.y,
        ) *
        (180 / Math.PI)
      const finalAngle =
        Math.atan2(
          event.clientX - prevRef.current.center.x,
          event.clientY - prevRef.current.center.y,
        ) *
        (180 / Math.PI)

      const rotateAngle = initialAngle - finalAngle
      const nextRotate = prevRef.current.rotate + rotateAngle
      handlerRef.current.style.rotate = nextRotate + 'deg'

      const nextVertexs = prevRef.current.vertexs.map((vertex) => {
        if (
          prevRef.current.center.x === null ||
          prevRef.current.center.y === null
        )
          return vertex
        else {
          const r = rotateAngle * (Math.PI / 180)

          const nextX =
            (vertex.x - prevRef.current.center.x) * Math.cos(r) -
            (vertex.y - prevRef.current.center.y) * Math.sin(r) +
            prevRef.current.center.x
          const nextY =
            (vertex.x - prevRef.current.center.x) * Math.sin(r) +
            (vertex.y - prevRef.current.center.y) * Math.cos(r) +
            prevRef.current.center.y
          return { ...vertex, x: nextX, y: nextY }
        }
      })

      setDrawings((drawings) =>
        drawings.map((drawing) =>
          drawing.id === selectedDrawing.id
            ? {
                ...drawing,
                vertexs: nextVertexs,
              }
            : drawing,
        ),
      )
    }
  }

  const handleMouseUp = (event: React.MouseEvent | MouseEvent) => {
    event.stopPropagation()
    document.body.style.cursor = 'auto'

    isDragged.current = false
    point.current = defaultPoint
    transitionType.current = null
  }

  const closeItemMenu = () => {
    setOpenItemMenu({ open: false, x: null, y: null })
  }

  const handleMouseClickRight = (event: React.MouseEvent | MouseEvent) => {
    event.preventDefault()
    setOpenItemMenu({ open: true, x: event.clientX, y: event.clientY })
  }

  const handleClickDeleteDrawingButton = () => {
    setDrawings((drawings) =>
      drawings.filter((drawing) => drawing.id !== selectedDrawingId),
    )
    setOpenItemMenu({ open: false, x: null, y: null })
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
    <>
      <div
        ref={handlerRef}
        className="absolute border-2 border-blue-400 cursor-move pointer-events-auto"
        onMouseDown={(e) => {
          transitionType.current = 'TRANSLATE'
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleMouseClickRight}
      >
        {resizeHandler.map(({ position, direction }) => (
          <div
            className={`${position} absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full cursor-nwse-resize`}
            onMouseDown={(e) => {
              transitionType.current = 'RESIZE'
              directionRef.current = direction as Direction
              handleMouseDown(e)
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        ))}
        {rotateHandler.map(({ position }) => (
          <div
            className={`absolute w-8 h-8 cursor-rotate ${position}`}
            onMouseDown={(e) => {
              transitionType.current = 'ROTATE'
              handleMouseDown(e)
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        ))}
      </div>
      {openItemMenu.open && (
        <div
          className="absolute flex items-center gap-4 p-3 text-white bg-gray-600 rounded-lg"
          style={{
            left: openItemMenu.x ?? undefined,
            top: openItemMenu.y ?? undefined,
          }}
        >
          <div
            className="cursor-pointer"
            onClick={handleClickDeleteDrawingButton}
          >
            Delete
          </div>
          <div className="cursor-pointer" onClick={closeItemMenu}>
            <IoCloseCircleOutline size={24} />
          </div>
        </div>
      )}
    </>
  )
}

export default Handler
