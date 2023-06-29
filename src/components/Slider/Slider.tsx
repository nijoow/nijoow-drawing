import { useState, useRef } from 'react'

const Slider = ({
  value,
  setValue,
  option,
}: {
  value: number
  setValue: any
  option?: any
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value))
  }

  return (
    <div className="flex items-center">
      <input
        type="range"
        value={value}
        onChange={handleChange}
        className="w-24 bg-red-50 fill-slate-600"
        {...option}
      />
    </div>
  )
}

export default Slider
