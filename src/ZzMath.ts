import { distBetweenTwoPointsOnACircle } from './math'
import { max, PI } from './utils'

const carouselDistanceVolume = (x1: number, x2: number, mapSize: number) => {
  const r1 = (x1 / mapSize) * 2 * PI
  const r2 = (x2 / mapSize) * 2 * PI
  const dist = distBetweenTwoPointsOnACircle(r1, r2) / 2
  const r = max(1, (dist * mapSize) / 10)
  const volume = 1 / r ** 1.2
  return volume
}

export { carouselDistanceVolume }
