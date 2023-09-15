export const rotateVertex = (vertexX: number, vertexY: number, centerX: number, centerY: number, rotate: number) => {
  const r = rotate * (Math.PI / 180)

  const x = (vertexX - centerX) * Math.cos(r) - (vertexY - centerY) * Math.sin(r)
  const y = (vertexX - centerX) * Math.sin(r) + (vertexY - centerY) * Math.cos(r)

  return { x, y }
}
