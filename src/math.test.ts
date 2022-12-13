import { expect, test } from 'vitest'
import { distBetweenTwoPointsOnACircle } from './math'
import { PI } from './utils'

test('dist between two opposite points on a circle', () => {
  let x1 = 0
  let x2 = 50
  let mapSize = 100
  let fullCircleInRadians = 2 * PI
  let r1 = (x1 / mapSize) * fullCircleInRadians
  let r2 = (x2 / mapSize) * fullCircleInRadians
  let actualDist = distBetweenTwoPointsOnACircle(r1, r2)
  expect(actualDist).toBeCloseTo(2)

  x1 = 25
  x2 = 75
  mapSize = 100
  fullCircleInRadians = 2 * Math.PI
  r1 = (x1 / mapSize) * fullCircleInRadians
  r2 = (x2 / mapSize) * fullCircleInRadians
  actualDist = distBetweenTwoPointsOnACircle(r1, r2)
  expect(actualDist).toBeCloseTo(2)
})

test('dist between two points on the same side of a circle', () => {
  const x1 = 0
  const x2 = 100
  const mapSize = 100
  const fullCircleInRadians = 2 * Math.PI
  const r1 = (x1 / mapSize) * fullCircleInRadians
  const r2 = (x2 / mapSize) * fullCircleInRadians
  const actualDist = distBetweenTwoPointsOnACircle(r1, r2)
  expect(actualDist).toBeCloseTo(0)
})

test('dist between two points on a circle', () => {
  const x1 = 10
  const x2 = 27
  const mapSize = 100
  const fullCircleInRadians = 2 * Math.PI
  const r1 = (x1 / mapSize) * fullCircleInRadians
  const r2 = (x2 / mapSize) * fullCircleInRadians
  const actualDist = distBetweenTwoPointsOnACircle(r1, r2)
  expect(actualDist).toBeCloseTo(1.02)
})
