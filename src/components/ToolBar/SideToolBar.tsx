'use client'

import { useState } from 'react'
import { RiCursorFill, RiPencilFill, RiPenNibFill } from 'react-icons/ri'
import {
  IoShapes,
  IoText,
  IoSquare,
  IoTriangle,
  IoEllipse,
} from 'react-icons/io5'
import { useRecoilState } from 'recoil'
import { modeAtom } from '@/recoil/atoms'
import { SubToolBar } from '@/types/type'

export default function SideToolBar() {
  const [mode, setMode] = useRecoilState(modeAtom)
  const [openSubToolBar, setOpenSubToolBar] = useState<SubToolBar>({
    type: null,
  })

  return (
    <div className="fixed z-10 flex flex-col items-center justify-center w-16 gap-2 py-2 overflow-visible text-white bg-gray-600 rounded-lg left-4 min-h-fit">
      <button
        type="button"
        className="p-2"
        onClick={() => setMode({ type: 'SELECT', subType: '' })}
      >
        <RiCursorFill size={20} />
      </button>
      <button
        type="button"
        className="p-2"
        onClick={() => setMode({ type: 'PENCIL', subType: '' })}
      >
        <RiPencilFill size={20} />
      </button>
      <button
        type="button"
        className="p-2"
        onClick={() => setMode({ type: 'VERTEX', subType: '' })}
      >
        <RiPenNibFill size={20} />
      </button>
      <div className="relative flex items-center justify-center w-full py-2">
        <button
          type="button"
          onClick={() => setOpenSubToolBar({ type: 'SHAPE' })}
        >
          <IoShapes size={20} />
        </button>
        {openSubToolBar.type === 'SHAPE' && (
          <div className="absolute top-0 flex bg-red-500 left-full ">
            <button
              type="button"
              className="p-2"
              onClick={() => {
                setMode({ type: 'SHAPE', subType: 'RECTANGLE' })
                setOpenSubToolBar({ type: null })
              }}
            >
              <IoSquare size={20} />
            </button>
            <button
              type="button"
              className="p-2"
              onClick={() => {
                setMode({ type: 'SHAPE', subType: 'ELLIPSE' })
                setOpenSubToolBar({ type: null })
              }}
            >
              <IoEllipse size={20} />
            </button>
            <button
              type="button"
              className="p-2"
              onClick={() => {
                setMode({ type: 'SHAPE', subType: 'TRIANGLE' })
                setOpenSubToolBar({ type: null })
              }}
            >
              <IoTriangle size={20} />
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        className="p-2"
        onClick={() => setMode({ type: 'TEXT', subType: '' })}
      >
        <IoText size={20} />
      </button>
    </div>
  )
}
