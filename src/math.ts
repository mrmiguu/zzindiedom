import { cos, PI, pow, sin, sqrt, tan } from './utils'

const clampN = (n: number, nceil: number) => {
  if (n < 0) return (nceil - ((nceil - n) % nceil)) % nceil
  else return n % nceil
}

const polygonInradius = (sides: number, pxTile: number) => pxTile / (2 * tan(PI / sides))

const distBetweenTwoPointsOnACircle = (r1: number, r2: number) => {
  const x1 = cos(r1)
  const y1 = sin(r1)
  const x2 = cos(r2)
  const y2 = sin(r2)
  return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2))
}

// https://easings.net/en#easeOutExpo
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - pow(2, -10 * x)
}

export { clampN, polygonInradius, distBetweenTwoPointsOnACircle, easeOutExpo }
