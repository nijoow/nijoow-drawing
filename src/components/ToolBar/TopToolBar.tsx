'use client'

import { useState } from 'react'
import { RiCursorFill, RiPencilFill, RiPenNibFill } from 'react-icons/ri'
import { IoStop, IoStopOutline } from 'react-icons/io5'
import { useRecoilState } from 'recoil'
import { currentOptionsAtom, modeAtom } from '@/recoil/atoms'
import { OptionsToolBar, SubToolBar } from '@/types/type'

export default function TopToolBar() {
  const [currentOptions, setCurrentOptions] = useRecoilState(currentOptionsAtom)
  const [openSubToolBar, setOpenSubToolBar] = useState<OptionsToolBar>({
    type: null,
  })

  console.log(currentOptions)
  return (
    <div className="fixed z-10 flex items-center overflow-visible text-white bg-gray-600 rounded-lg min-w-max left-4 top-4 min-h-fit">
      <div className="relative flex items-center justify-center p-3 w-fit">
        <button
          type="button"
          onClick={() => setOpenSubToolBar({ type: 'FILL' })}
        >
          <IoStop size={20} fill={currentOptions.fill} />
        </button>
        {openSubToolBar.type === 'FILL' && (
          <div className="absolute left-0 flex p-3 bg-gray-600 rounded-lg top-full">
            FILL
          </div>
        )}
      </div>
      <div className="relative flex items-center justify-center p-3 w-fit">
        <button
          type="button"
          onClick={() => setOpenSubToolBar({ type: 'STROKE' })}
        >
          <IoStopOutline size={20} fill={currentOptions.stroke} />
        </button>
        {openSubToolBar.type === 'STROKE' && (
          <div className="absolute left-0 flex p-3 bg-gray-600 rounded-lg top-full">
            STROKE
          </div>
        )}
      </div>
      <div className="relative flex items-center justify-center p-3 w-fit">
        <button
          type="button"
          className="flex items-center space-x-2 min-w-fit"
          onClick={() => setOpenSubToolBar({ type: 'STORKE_WIDTH' })}
        >
          <span>Stroke</span>
          <span className="min-w-fit">{currentOptions.strokeWidth} px</span>
        </button>
        {openSubToolBar.type === 'STORKE_WIDTH' && (
          <div className="absolute left-0 flex p-3 bg-gray-600 rounded-lg top-full">
            STORKE WIDTH
          </div>
        )}
      </div>{' '}
      <div className="relative flex items-center justify-center p-3 w-fit">
        <button
          type="button"
          className="flex items-center space-x-2 min-w-fit"
          onClick={() => setOpenSubToolBar({ type: 'OPACITY' })}
        >
          <span>Opacity</span>
          <span className="min-w-fit">{currentOptions.opacity * 100} %</span>
        </button>
        {openSubToolBar.type === 'OPACITY' && (
          <div className="absolute left-0 flex p-3 bg-gray-600 rounded-lg top-full">
            OPACITY
          </div>
        )}
      </div>
    </div>
  )
}
