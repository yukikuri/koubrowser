
export type Rect = {
  x: number
  y: number
  width: number
  height: number
}
export function intersect(a: Rect, b: Rect): Rect | undefined {
  const left = Math.max(a.x, b.x)
  const top = Math.max(a.y, b.y)
  const right = Math.min(a.x + a.width, b.x + b.width)
  const bottom = Math.min(a.y + a.height, b.y + b.height)

  if (left >= right || top >= bottom) {
    // 重なりなし
    return undefined
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  }

}
