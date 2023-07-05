'use client'

import { useEffect, useRef, useState } from 'react'
import { IoStop } from 'react-icons/io5'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  basicOptionsAtom,
  currentOptionsState,
  drawingsAtom,
  selectedDrawingIdAtom,
  selectedDrawingState,
} from '@/recoil/atoms'
import { OptionsToolBar } from '@/types/type'
import { ChromePicker } from 'react-color'
import Slider from '@/components/Slider/Slider'

export default function TopToolBar() {
  const selectedDrawing = useRecoilValue(selectedDrawingState)
  const [drawings, setDrawings] = useRecoilState(drawingsAtom)

  const currentOptions = useRecoilValue(currentOptionsState)
  const [, setBasicOptions] = useRecoilState(basicOptionsAtom)
  const [openSubToolBar, setOpenSubToolBar] = useState<OptionsToolBar>({
    type: null,
  })
  const toolBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (
        toolBarRef.current &&
        !toolBarRef.current.contains(event.target as Node)
      ) {
        setOpenSubToolBar({ type: null })
      }
    }
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <div
      ref={toolBarRef}
      className="fixed z-10 flex items-center overflow-visible text-white bg-gray-600 rounded-lg min-w-max left-4 top-4 min-h-fit"
    >
      <div className="relative flex items-center justify-center p-3 w-fit">
        <button
          type="button"
          className="flex items-center justify-center w-5 h-5 bg-white rounded-sm"
          onClick={() => setOpenSubToolBar({ type: 'FILL' })}
        >
          <IoStop size={20} fill={currentOptions.fill} />
        </button>
        {openSubToolBar.type === 'FILL' && (
          <div className="absolute left-0 flex p-3 bg-gray-600 rounded-lg top-full">
            <ChromePicker
              disableAlpha
              color={currentOptions.fill}
              onChange={(color) => {
                if (selectedDrawing)
                  setDrawings(
                    drawings.map((drawing) =>
                      drawing.id === selectedDrawing.id
                        ? {
                            ...drawing,
                            fill: color.hex,
                          }
                        : drawing,
                    ),
                  )
                else setBasicOptions({ ...currentOptions, fill: color.hex })
              }}
            />
          </div>
        )}
      </div>
      <div className="relative flex items-center justify-center p-3 w-fit">
        <button
          type="button"
          className="flex items-center justify-center w-5 h-5 bg-white rounded-sm"
          onClick={() => setOpenSubToolBar({ type: 'STROKE' })}
        >
          <div
            className="flex items-center justify-center w-[14.2px] h-[14.2px] rounded-sm"
            style={{ backgroundColor: currentOptions.stroke }}
          >
            <IoStop size={10} className="fill-white" />
          </div>
        </button>
        {openSubToolBar.type === 'STROKE' && (
          <div className="absolute left-0 flex p-3 bg-gray-600 rounded-lg top-full">
            <ChromePicker
              disableAlpha
              color={currentOptions.stroke}
              onChange={(color) => {
                if (selectedDrawing)
                  setDrawings(
                    drawings.map((drawing) =>
                      drawing.id === selectedDrawing.id
                        ? {
                            ...drawing,
                            stroke: color.hex,
                          }
                        : drawing,
                    ),
                  )
                else setBasicOptions({ ...currentOptions, stroke: color.hex })
              }}
            />
          </div>
        )}
      </div>
      <div className="relative flex items-center justify-center w-32 p-3">
        <button
          type="button"
          className="flex items-center space-x-2 min-w-fit"
          onClick={() => setOpenSubToolBar({ type: 'STORKE_WIDTH' })}
        >
          <span>Stroke</span>
          <span className="min-w-fit">{currentOptions.strokeWidth} px</span>
        </button>
        {openSubToolBar.type === 'STORKE_WIDTH' && (
          <div className="absolute left-0 flex p-3 py-3 bg-gray-600 rounded-lg top-full">
            <Slider
              value={currentOptions.strokeWidth}
              setValue={(value: number) => {
                if (selectedDrawing)
                  setDrawings(
                    drawings.map((drawing) =>
                      drawing.id === selectedDrawing.id
                        ? {
                            ...drawing,
                            strokeWidth: value,
                          }
                        : drawing,
                    ),
                  )
                else setBasicOptions({ ...currentOptions, strokeWidth: value })
              }}
              option={{ min: 0, max: 50, step: 1 }}
            />
          </div>
        )}
      </div>
      <div className="relative flex items-center justify-center w-32 p-3">
        <button
          type="button"
          className="flex items-center space-x-2 min-w-fit"
          onClick={() => setOpenSubToolBar({ type: 'OPACITY' })}
        >
          <span>Opacity</span>
          <span className="min-w-fit">
            {Math.round(currentOptions.opacity * 100)} %
          </span>
        </button>
        {openSubToolBar.type === 'OPACITY' && (
          <div className="absolute left-0 flex p-3 bg-gray-600 rounded-lg top-full">
            <Slider
              value={currentOptions.opacity * 100}
              setValue={(value: number) => {
                if (selectedDrawing)
                  setDrawings(
                    drawings.map((drawing) =>
                      drawing.id === selectedDrawing.id
                        ? {
                            ...drawing,
                            opacity: Math.round(value) / 100,
                          }
                        : drawing,
                    ),
                  )
                else
                  setBasicOptions({
                    ...currentOptions,
                    opacity: Math.round(value) / 100,
                  })
              }}
              option={{ min: 1, max: 100, step: 1 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
