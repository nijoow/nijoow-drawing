'use client'
import React, { useEffect, useState } from 'react'

const SplashScreen = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 1500)
    return () => clearTimeout(timeout)
  }, [])

  return isMounted ? null : (
    <div className="fixed z-50 w-full h-full bg-black/60 font-montserrat">
      <svg viewBox="0 0 960 300" className="text-6xl">
        <symbol id="s-text">
          <text textAnchor="middle" x="50%" y="80%">
            Nijoow Drawing
          </text>
        </symbol>
        <g>
          <use xlinkHref="#s-text" className="text-copy" />
          <use xlinkHref="#s-text" className="text-copy" />
          <use xlinkHref="#s-text" className="text-copy" />
          <use xlinkHref="#s-text" className="text-copy" />
          <use xlinkHref="#s-text" className="text-copy" />
          <use xlinkHref="#s-text" className="text-copy" />
          <use xlinkHref="#s-text" className="text-copy" />
        </g>
      </svg>
    </div>
  )
}

export default SplashScreen
