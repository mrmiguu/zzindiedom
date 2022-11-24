const { log, warn, error } = console
const { stringify, parse } = JSON
const { min, max, ceil, random, abs, pow, sqrt, sin, cos, tan, atan, atan2, PI } = Math
const { keys, values, entries } = Object

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const pickRandom = <T>(list: readonly T[]): T => list[~~(list.length * random())]!

const urlSearchParams = () =>
  Array.from(new URLSearchParams(location.search)).reduce<{ [k: string]: string }>(
    (m, [k, v]) => ({ ...m, [k]: v }),
    {},
  )

async function unpackDynamicImport<T = any>(promise: () => Promise<{ default: T }>) {
  const result = await promise()
  return result.default
}

const coordinatedUniversalMilliseconds = () => Date.now()

function promisechannel<T = any>(): [send: (value: T) => void, waitFor: Promise<T>] {
  let send: (value: T) => void = undefined as any
  const waitFor = new Promise<T>(resolve => (send = resolve))
  return [send, waitFor]
}

export {
  log,
  warn,
  error,
  stringify,
  parse,
  min,
  max,
  ceil,
  random,
  abs,
  pow,
  sqrt,
  sin,
  cos,
  tan,
  atan,
  atan2,
  PI,
  keys,
  values,
  entries,
  sleep,
  pickRandom,
  urlSearchParams,
  unpackDynamicImport,
  coordinatedUniversalMilliseconds,
  promisechannel,
}
