export const remap = (
  value: number,
  beforeLow: number,
  beForeHigh: number,
  afterLow: number,
  afterHigh: number,
) => {
  return (
    afterLow +
    ((value - beforeLow) * (afterHigh - afterLow)) / (beForeHigh - beforeLow)
  )
}
