import { PI, pow, tan } from './utils'

const clampN = (n: number, nceil: number) => {
  if (n < 0) return (nceil - ((nceil - n) % nceil)) % nceil
  else return n % nceil
}

const polygonInradius = (sides: number, pxTile: number) => pxTile / (2 * tan(PI / sides))

// https://easings.net/en#easeOutExpo
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - pow(2, -10 * x)
}

export { clampN, polygonInradius, easeOutExpo }
