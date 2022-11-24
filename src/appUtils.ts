import { msRootFrame } from './consts'
import { OneZeroOne } from './types'

const frameInterval = (framePriority: number) => 2 ** framePriority
const frameIntervalMs = (framePriority: number, rootMs: number) => frameInterval(framePriority) * rootMs
const easeExpoOutTransitionDurationMs = (framePriority: number) => frameIntervalMs(framePriority, msRootFrame) * 10
const easeLinearTransitionDurationMs = (framePriority: number) => frameIntervalMs(framePriority, msRootFrame) * 1.3

function roundGamepadAxes(gamepadAxes: readonly number[], divideBy: number = 1) {
  let steppedAxes = Array<OneZeroOne>(gamepadAxes.length)
  for (let a = 0; a < steppedAxes.length; a++) {
    const axis = gamepadAxes[a]! / divideBy
    steppedAxes[a] = (axis < 0 ? ~~(axis - 0.5) : ~~(axis + 0.5)) as typeof steppedAxes[number]
  }
  return steppedAxes
}

export {
  frameInterval,
  frameIntervalMs,
  easeExpoOutTransitionDurationMs,
  easeLinearTransitionDurationMs,
  roundGamepadAxes,
}
