import { drawingsAtom, selectedDrawingIdAtom, selectedDrawingState } from '@/recoil/atoms'
import { Direction, Vertex } from '@/types/type'
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { IoCloseCircleOutline } from 'react-icons/io5'
import { remap } from '@/utils/remap'
import { rotateVertex } from '@/utils/rotateVertex'
import VerticalDivider from '../common/VerticalDivider'
import usePointDrag from '@/hooks/usePointDrag'

const rotateHandler = [
  { key: 'TL', position: '-top-9 -left-9' },
  { key: 'TR', position: '-top-9 -right-9' },
  { key: 'BL', position: '-bottom-9 -left-9 ' },
  { key: 'BR', position: '-bottom-9 -right-9' },
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
  const [drawings, setDrawings] = useRecoilState(drawingsAtom)
  const selectedDrawing = useRecoilValue(selectedDrawingState)
  const selectedDrawingIndex = drawings.findIndex((drawing) => drawing.id === selectedDrawingId)

  if (!selectedDrawing) return null

  // custom hooks
  const { point, isDragged, onDrag, offDrag, prevRef, setStartPoint, resetPoint, resetPrev } = usePointDrag()

  // useState
  const [openItemMenu, setOpenItemMenu] = useState<{
    open: boolean
    x: number | null
    y: number | null
  }>({ open: false, x: null, y: null })

  // uesRef
  const transitionType = useRef<'TRANSLATE' | 'RESIZE' | 'ROTATE' | null>(null)
  const handlerRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef<Direction>(null)

  // useEffect
  useEffect(() => {
    if (!handlerRef.current) return
    handlerRef.current.style.width = `${selectedDrawing.width}px`
    handlerRef.current.style.height = `${selectedDrawing.height}px`
    handlerRef.current.style.top = `${selectedDrawing.center.y - selectedDrawing.height / 2}px`
    handlerRef.current.style.left = `${selectedDrawing.center.x - selectedDrawing.width / 2}px`
    handlerRef.current.style.rotate = `${selectedDrawing.rotate}deg`
  }, [selectedDrawingId])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // function
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation()

    resetPrev()
    onDrag()
    setStartPoint(event)

    if (!handlerRef.current) return
    prevRef.current.width = handlerRef.current.offsetWidth
    prevRef.current.height = handlerRef.current.offsetHeight
    prevRef.current.center.x = handlerRef.current.offsetLeft + prevRef.current.width / 2
    prevRef.current.center.y = handlerRef.current.offsetTop + prevRef.current.height / 2
    prevRef.current.rotate = selectedDrawing.rotate
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
                vertexs: prevRef.current.vertexs?.map((vertex: Vertex) => {
                  const newVertex = { ...vertex }
                  for (const key in vertex) {
                    if (key === 'x' || key === 'currentHandlerX' || key === 'nextHandlerX') {
                      newVertex[key] = (vertex[key] as number) + horizontalChange
                    } else if (key === 'y' || key === 'currentHandlerY' || key === 'nextHandlerY') {
                      newVertex[key] = (vertex[key] as number) + verticalChange
                    }
                  }
                  return newVertex
                }),
              }
            : drawing,
        ),
      )
    } else if (transitionType.current === 'RESIZE') {
      if (!directionRef.current) return

      const rotatedStartPoint = rotateVertex(
        point.current.startX,
        point.current.startY,
        prevRef.current.center.x,
        prevRef.current.center.y,
        -prevRef.current.rotate,
      )
      const rotatedEndPoint = rotateVertex(
        event.clientX,
        event.clientY,
        prevRef.current.center.x,
        prevRef.current.center.y,
        -prevRef.current.rotate,
      )

      const resize = (deltaX: number, deltaY: number) => {
        if (handlerRef.current === null || prevRef.current.width === null || prevRef.current.height === null) return
        const nextCenterX =
          (handlerRef.current.getBoundingClientRect().left + handlerRef.current.getBoundingClientRect().right) / 2

        const nextCenterY =
          (handlerRef.current.getBoundingClientRect().top + handlerRef.current.getBoundingClientRect().bottom) / 2

        const width = prevRef.current.width + deltaX
        const height = prevRef.current.height + deltaY

        const nextWidth = Math.abs(width)
        const nextHeight = Math.abs(height)

        const nextVertexs = prevRef.current.vertexs?.map((vertex) => {
          const getNextVertex = (prevX: number, prevY: number) => {
            const rotatedVertex = rotateVertex(
              prevX,
              prevY,
              prevRef.current.center.x!,
              prevRef.current.center.y!,
              -prevRef.current.rotate!,
            )
            const nextX = remap(
              rotatedVertex.x,
              -prevRef.current.width! / 2,
              prevRef.current.width! / 2,
              -width / 2,
              width / 2,
            )
            const nextY = remap(
              rotatedVertex.y,
              -prevRef.current.height! / 2,
              prevRef.current.height! / 2,
              -height / 2,
              height / 2,
            )
            return rotateVertex(nextX, nextY, 0, 0, prevRef.current.rotate!)
          }
          let nextVertex = { ...vertex }
          const { x, y } = getNextVertex(vertex.x, vertex.y)
          nextVertex = { ...nextVertex, x: x + prevRef.current.center.x!, y: y + prevRef.current.center.y! }
          if (vertex.currentHandlerX && vertex.currentHandlerY) {
            const { x: currentHandlerX, y: currentHandlerY } = getNextVertex(
              vertex.currentHandlerX,
              vertex.currentHandlerY,
            )
            nextVertex = {
              ...nextVertex,
              currentHandlerX: currentHandlerX + prevRef.current.center.x!,
              currentHandlerY: currentHandlerY + prevRef.current.center.y!,
            }
          }
          if (vertex.nextHandlerX && vertex.nextHandlerY) {
            const { x: nextHandlerX, y: nextHandlerY } = getNextVertex(vertex.nextHandlerX, vertex.nextHandlerY)
            nextVertex = {
              ...nextVertex,
              nextHandlerX: nextHandlerX + prevRef.current.center.x!,
              nextHandlerY: nextHandlerY + prevRef.current.center.y!,
            }
          }
          return nextVertex
        })

        handlerRef.current.style.width = nextWidth + 'px'
        handlerRef.current.style.height = nextHeight + 'px'
        handlerRef.current.style.left = nextCenterX - nextWidth / 2 + 'px'
        handlerRef.current.style.top = nextCenterY - nextHeight / 2 + 'px'

        setDrawings((drawings) =>
          drawings.map((drawing) =>
            drawing.id === selectedDrawing.id
              ? {
                  ...drawing,
                  width: nextWidth,
                  height: nextHeight,
                  center: { x: nextCenterX, y: nextCenterY },
                  vertexs: nextVertexs,
                }
              : drawing,
          ),
        )
      }
      const deltaX = (rotatedEndPoint.x - rotatedStartPoint.x) * 2
      const deltaY = (rotatedEndPoint.y - rotatedStartPoint.y) * 2

      switch (directionRef.current) {
        case 'TL':
          resize(-deltaX, -deltaY)
          break
        case 'T':
          resize(0, -deltaY)
          break
        case 'TR':
          resize(deltaX, -deltaY)
          break
        case 'L':
          resize(-deltaX, 0)
          break
        case 'R':
          resize(deltaX, 0)
          break
        case 'BL':
          resize(-deltaX, deltaY)
          break
        case 'B':
          resize(0, deltaY)
          break
        case 'BR':
          resize(deltaX, deltaY)
          break
        default:
          break
      }
    } else if (transitionType.current === 'ROTATE' && prevRef.current.rotate !== null) {
      document.body.style.cursor = 'url(/image/cursor/rotate.svg) 12 12, auto'
      const initialAngle =
        Math.atan2(point.current.startX - prevRef.current.center.x, point.current.startY - prevRef.current.center.y) *
        (180 / Math.PI)
      const finalAngle =
        Math.atan2(event.clientX - prevRef.current.center.x, event.clientY - prevRef.current.center.y) * (180 / Math.PI)

      const rotateAngle = initialAngle - finalAngle
      const nextRotate = prevRef.current.rotate + rotateAngle
      handlerRef.current.style.rotate = nextRotate + 'deg'

      const nextVertexs = prevRef.current.vertexs.map((vertex) => {
        const getNextVertex = (prevX: number, prevY: number) => {
          const r = rotateAngle * (Math.PI / 180)

          const nextX =
            (prevX - prevRef.current.center.x!) * Math.cos(r) -
            (prevY - prevRef.current.center.y!) * Math.sin(r) +
            prevRef.current.center.x!
          const nextY =
            (prevX - prevRef.current.center.x!) * Math.sin(r) +
            (prevY - prevRef.current.center.y!) * Math.cos(r) +
            prevRef.current.center.y!

          return { x: nextX, y: nextY }
        }

        let nextVertex = { ...vertex }
        const { x, y } = getNextVertex(vertex.x, vertex.y)
        nextVertex = { ...nextVertex, x, y }
        if (vertex.currentHandlerX && vertex.currentHandlerY) {
          const { x: currentHandlerX, y: currentHandlerY } = getNextVertex(
            vertex.currentHandlerX,
            vertex.currentHandlerY,
          )
          nextVertex = {
            ...nextVertex,
            currentHandlerX: currentHandlerX,
            currentHandlerY: currentHandlerY,
          }
        }
        if (vertex.nextHandlerX && vertex.nextHandlerY) {
          const { x: nextHandlerX, y: nextHandlerY } = getNextVertex(vertex.nextHandlerX, vertex.nextHandlerY)
          nextVertex = {
            ...nextVertex,
            nextHandlerX: nextHandlerX,
            nextHandlerY: nextHandlerY,
          }
        }
        return nextVertex
      })

      setDrawings((drawings) =>
        drawings.map((drawing) =>
          drawing.id === selectedDrawing.id
            ? {
                ...drawing,
                rotate: nextRotate,
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

    offDrag()
    resetPoint()
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
    setDrawings((drawings) => drawings.filter((drawing) => drawing.id !== selectedDrawingId))
    setOpenItemMenu({ open: false, x: null, y: null })
  }

  const handleClickBringToFrontButton = () => {
    if (drawings.length === 0) return

    const nextDrawings = [...drawings]
    nextDrawings.splice(selectedDrawingIndex, 1)
    nextDrawings.splice(selectedDrawingIndex + 1, 0, selectedDrawing)
    setDrawings(nextDrawings)

    setOpenItemMenu({ open: false, x: null, y: null })
  }

  const handleClickSendToBackButton = () => {
    if (drawings.length === 0) return

    const nextDrawings = [...drawings]
    nextDrawings.splice(selectedDrawingIndex, 1)
    nextDrawings.splice(selectedDrawingIndex - 1, 0, selectedDrawing)
    setDrawings(nextDrawings)

    setOpenItemMenu({ open: false, x: null, y: null })
  }

  const handleClickBringForwardButton = () => {
    if (drawings.length === 0) return

    const nextDrawings = [...drawings]
    nextDrawings.splice(selectedDrawingIndex, 1)
    setDrawings([...nextDrawings, selectedDrawing])

    setOpenItemMenu({ open: false, x: null, y: null })
  }

  const handleClickSendBackwardButton = () => {
    if (drawings.length === 0) return

    const nextDrawings = [...drawings]
    nextDrawings.splice(selectedDrawingIndex, 1)
    setDrawings([selectedDrawing, ...nextDrawings])

    setOpenItemMenu({ open: false, x: null, y: null })
  }

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
            key={direction}
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
        {rotateHandler.map(({ position, key }) => (
          <div
            key={key}
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
          className="absolute flex items-center gap-2.5 p-3 text-white bg-gray-600 rounded-lg"
          style={{
            left: openItemMenu.x ?? undefined,
            top: openItemMenu.y ?? undefined,
          }}
        >
          <div className="cursor-pointer" onClick={handleClickDeleteDrawingButton}>
            Delete
          </div>
          <VerticalDivider />
          <div className="cursor-pointer" onClick={handleClickBringToFrontButton}>
            Bring To Front
          </div>
          <VerticalDivider />
          <div className="cursor-pointer" onClick={handleClickSendToBackButton}>
            Send To Back
          </div>
          <VerticalDivider />
          <div className="cursor-pointer" onClick={handleClickBringForwardButton}>
            Bring Forward
          </div>
          <VerticalDivider />
          <div className="cursor-pointer" onClick={handleClickSendBackwardButton}>
            Send Backward
          </div>
          <VerticalDivider />
          <div className="cursor-pointer" onClick={closeItemMenu}>
            <IoCloseCircleOutline size={24} />
          </div>
        </div>
      )}
    </>
  )
}

export default Handler
