'use client'

import { useEffect, useRef, useState } from 'react'
import { IoStop } from 'react-icons/io5'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  basicOptionsAtom,
  currentOptionsState,
  drawingsAtom,
  recentColorsAtom,
  selectedDrawingState,
} from '@/recoil/atoms'
import { OptionsToolBar } from '@/types/type'
import { ChromePicker, ColorResult } from 'react-color'
import Slider from '@/components/Slider/Slider'

const ColorSubToolBar = ({ type }: { type: 'fill' | 'stroke' }) => {
  // recoil
  const selectedDrawing = useRecoilValue(selectedDrawingState)
  const [drawings, setDrawings] = useRecoilState(drawingsAtom)
  const currentOptions = useRecoilValue(currentOptionsState)
  const [, setBasicOptions] = useRecoilState(basicOptionsAtom)
  const [recentColors, setRecentColors] = useRecoilState(recentColorsAtom)

  // function
  const handleClickNoneColor = () => setColor('none')

  const handleClickRecentColor = (color: string) => setColor(color)

  const onChangeColorPicker = (color: ColorResult) => setColor(color.hex)

  const setColor = (color: string) => {
    if (selectedDrawing)
      setDrawings(
        drawings.map((drawing) =>
          drawing.id === selectedDrawing.id
            ? {
                ...drawing,
                [type]: color,
              }
            : drawing,
        ),
      )
    else setBasicOptions({ ...currentOptions, [type]: color })
  }

  const onChangeCompleteColorPicker = (color: ColorResult) => {
    setRecentColors((recentColors) =>
      (recentColors.includes(color.hex)
        ? [
            color.hex,
            ...recentColors.filter((recentColor) => recentColor !== color.hex),
          ]
        : [color.hex, ...recentColors]
      ).slice(0, 7),
    )
  }

  return (
    <div className="absolute flex-col left-0 gap-2 flex p-3 bg-gray-600 rounded-lg top-full">
      <div className="w-full h-5 flex gap-[9px]">
        <div
          className="w-5 h-5 cursor-pointer bg-white rounded-sm flex items-center justify-center"
          onClick={handleClickNoneColor}
        >
          <div className="bg-red-500 h-0.5 w-full rotate-45" />
        </div>

        {recentColors.map((color) => (
          <div
            key={color}
            className="w-5 h-5 cursor-pointer rounded-sm"
            style={{ backgroundColor: color }}
            onClick={() => handleClickRecentColor(color)}
          />
        ))}
      </div>
      <ChromePicker
        disableAlpha
        color={currentOptions[type]}
        onChange={onChangeColorPicker}
        onChangeComplete={onChangeCompleteColorPicker}
      />
    </div>
  )
}
export default function TopToolBar() {
  // recoil
  const selectedDrawing = useRecoilValue(selectedDrawingState)
  const [drawings, setDrawings] = useRecoilState(drawingsAtom)
  const currentOptions = useRecoilValue(currentOptionsState)
  const [, setBasicOptions] = useRecoilState(basicOptionsAtom)
  const [openSubToolBar, setOpenSubToolBar] = useState<OptionsToolBar>({
    type: null,
  })

  // useRef
  const toolBarRef = useRef<HTMLDivElement>(null)

  // useEffect
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

  const setStrokeWidthValue = (value: number) => {
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
  }

  const setOpacityValue = (value: number) => {
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
  }

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
        {openSubToolBar.type === 'FILL' && <ColorSubToolBar type="fill" />}
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
        {openSubToolBar.type === 'STROKE' && <ColorSubToolBar type="stroke" />}
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
              setValue={setStrokeWidthValue}
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
              setValue={setOpacityValue}
              option={{ min: 1, max: 100, step: 1 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
