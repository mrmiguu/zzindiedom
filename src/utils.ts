import seedrandom from 'seedrandom'

const { log, warn, error } = console
const { stringify, parse } = JSON
const { min, max, ceil, abs, pow, sqrt, sin, cos, tan, atan, atan2, PI } = Math
const { keys, values, entries } = Object

type RandomOptions = {
  seed: string
}

const _random: { [seed: string]: seedrandom.PRNG } = {}
const random = ({ seed }: Partial<RandomOptions> = {}) => {
  const key = seed ?? '*'
  _random[key] = _random[key] ?? seedrandom(seed)
  return _random[key]!()
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const pickRandom = <T>(list: readonly T[], { seed }: Partial<RandomOptions> = {}): T =>
  list[~~(list.length * random({ seed }))]!

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
