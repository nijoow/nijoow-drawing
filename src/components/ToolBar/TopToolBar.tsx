'use client'

import { useState } from 'react'
import { IoStop } from 'react-icons/io5'
import { useRecoilState } from 'recoil'
import { currentOptionsAtom } from '@/recoil/atoms'
import { OptionsToolBar } from '@/types/type'
import { ChromePicker } from 'react-color'
import Slider from '@/components/Slider/Slider'

export default function TopToolBar() {
  const [currentOptions, setCurrentOptions] = useRecoilState(currentOptionsAtom)
  const [openSubToolBar, setOpenSubToolBar] = useState<OptionsToolBar>({
    type: null,
  })

  return (
    <div className="fixed z-10 flex items-center overflow-visible text-white bg-gray-600 rounded-lg min-w-max left-4 top-4 min-h-fit">
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
              onChange={(color) =>
                setCurrentOptions({ ...currentOptions, fill: color.hex })
              }
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
              onChange={(color) =>
                setCurrentOptions({ ...currentOptions, stroke: color.hex })
              }
            />
          </div>
        )}
      </div>
      <div className="relative flex items-center justify-center p-3 w-32">
        <button
          type="button"
          className="flex items-center space-x-2 min-w-fit"
          onClick={() => setOpenSubToolBar({ type: 'STORKE_WIDTH' })}
        >
          <span>Stroke</span>
          <span className="min-w-fit">{currentOptions.strokeWidth} px</span>
        </button>
        {openSubToolBar.type === 'STORKE_WIDTH' && (
          <div className="absolute left-0 flex p-3 bg-gray-600 rounded-lg top-full py-3">
            <Slider
              value={currentOptions.strokeWidth}
              setValue={(value: number) =>
                setCurrentOptions({ ...currentOptions, strokeWidth: value })
              }
              option={{ min: 0, max: 50, step: 1 }}
            />
          </div>
        )}
      </div>
      <div className="relative flex items-center justify-center p-3 w-32">
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
              setValue={(value: number) =>
                setCurrentOptions({
                  ...currentOptions,
                  opacity: Math.round(value) / 100,
                })
              }
              option={{ min: 1, max: 100, step: 1 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
