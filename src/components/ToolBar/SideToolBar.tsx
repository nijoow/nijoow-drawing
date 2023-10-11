'use client'

import { useEffect, useRef, useState } from 'react'
import { RiCursorFill, RiPencilFill, RiPenNibFill } from 'react-icons/ri'
import { IoShapes, IoText, IoSquare, IoTriangle, IoEllipse, IoNavigate } from 'react-icons/io5'
import { useRecoilState } from 'recoil'
import { modeAtom } from '@/recoil/atoms'
import { SubToolBar } from '@/types/type'

export default function SideToolBar() {
  const [mode, setMode] = useRecoilState(modeAtom)
  const [openSubToolBar, setOpenSubToolBar] = useState<SubToolBar>({
    type: null,
  })
  const toolBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (toolBarRef.current && !toolBarRef.current.contains(event.target as Node)) {
        setOpenSubToolBar({ type: null })
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'v':
        case 'ㅍ':
          setMode({ type: 'SELECT', subType: 'SHAPE' })
          break
        case 'a':
        case 'ㅁ':
          setMode({ type: 'SELECT', subType: 'VERTEX' })
          break
        case 'n':
        case 'ㅜ':
          setMode({ type: 'PENCIL', subType: null })
          break
        case 'p':
        case 'ㅔ':
          setMode({ type: 'VERTEX', subType: null })
          break
        default:
          break
      }
    }
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div
      ref={toolBarRef}
      className="fixed z-10 flex flex-col items-center justify-center w-16 gap-2 py-2 overflow-visible text-white -translate-y-1/2 bg-gray-600 rounded-lg left-4 top-1/2 min-h-fit"
    >
      <button
        type="button"
        className={`py-2 w-full hover:text-[#4ea1d3] flex items-center justify-center ${
          mode.type === 'SELECT' && mode.subType === 'SHAPE' ? 'text-[#4ea1d3]' : ''
        }`}
        onClick={() => {
          setMode({ type: 'SELECT', subType: 'SHAPE' })
          setOpenSubToolBar({ type: null })
        }}
      >
        <RiCursorFill size={20} />
      </button>
      <button
        type="button"
        className={`py-2 w-full hover:text-[#4ea1d3] flex items-center justify-center ${
          mode.type === 'SELECT' && mode.subType === 'VERTEX' ? 'text-[#4ea1d3]' : ''
        }`}
        onClick={() => {
          setMode({ type: 'SELECT', subType: 'VERTEX' })
          setOpenSubToolBar({ type: null })
        }}
      >
        <IoNavigate size={20} />
      </button>
      <button
        type="button"
        className={`py-2 w-full hover:text-[#4ea1d3] flex items-center justify-center ${
          mode.type === 'PENCIL' ? 'text-[#4ea1d3]' : ''
        }`}
        onClick={() => {
          setMode({ type: 'PENCIL', subType: null })
          setOpenSubToolBar({ type: null })
        }}
      >
        <RiPencilFill size={20} />
      </button>
      <button
        type="button"
        className={`py-2 w-full hover:text-[#4ea1d3] flex items-center justify-center ${
          mode.type === 'VERTEX' ? 'text-[#4ea1d3]' : ''
        }`}
        onClick={() => {
          setMode({ type: 'VERTEX', subType: null })
          setOpenSubToolBar({ type: null })
        }}
      >
        <RiPenNibFill size={20} />
      </button>
      <div className="relative flex items-center justify-center w-full ">
        <button
          type="button"
          className={`py-2 w-full hover:text-[#4ea1d3] flex items-center justify-center ${
            mode.type === 'SHAPE' ? 'text-[#4ea1d3]' : ''
          }`}
          onClick={() => setOpenSubToolBar({ type: 'SHAPE' })}
        >
          <IoShapes size={20} />
        </button>
        {openSubToolBar.type === 'SHAPE' && (
          <div className="absolute top-0 flex flex-col bg-gray-600 rounded-b-lg rounded-r-lg left-full ">
            <button
              type="button"
              className="p-3 hover:text-gray-400"
              onClick={() => {
                setMode({ type: 'SHAPE', subType: 'RECTANGLE' })
                setOpenSubToolBar({ type: null })
              }}
            >
              <IoSquare size={20} />
            </button>
            <button
              type="button"
              className="p-3 hover:text-gray-400"
              onClick={() => {
                setMode({ type: 'SHAPE', subType: 'ELLIPSE' })
                setOpenSubToolBar({ type: null })
              }}
            >
              <IoEllipse size={20} />
            </button>
            <button
              type="button"
              className="p-3 hover:text-gray-400"
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
      {/* <button
        type="button"
        className={`py-2 w-full hover:text-[#4ea1d3] flex items-center justify-center ${
          mode.type === 'TEXT' ? 'text-[#4ea1d3]' : ''
        }`}
        disabled
        onClick={() => {
          setMode({ type: 'TEXT', subType: null })
          setOpenSubToolBar({ type: null })
        }}
      >
        <IoText size={20} />
      </button> */}
    </div>
  )
}
