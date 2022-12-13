import { flatten } from 'flat'
import { FlatValueOrKeyArray, FlatValueOrKeyMap, KeyMap } from './FlatTireTypes'

function sprinkleKeys(obj: { [key: string]: any }) {
  for (const key in obj) {
    const isObj = typeof obj[key] === 'object'

    obj['keys'] = obj['keys'] ?? []
    obj['keys'].push(key)

    if (isObj) sprinkleKeys(obj[key])
  }
}

function flattenKeyedData(obj: { [key: string]: any }): { [path: string]: FlatValueOrKeyArray } {
  return flatten(obj, { delimiter: '__', safe: true })
}

function unarrayFlattenedDataKeys(arrayedKeys: { [path: string]: FlatValueOrKeyArray }): {
  [path: string]: FlatValueOrKeyMap
} {
  const mappedKeys: { [path: string]: FlatValueOrKeyMap } = {}

  for (const path in arrayedKeys) {
    const value = arrayedKeys[path]!

    if (typeof value === 'object') {
      for (const key of value) {
        mappedKeys[path] = mappedKeys[path] ?? {}
        const keymap = mappedKeys[path] as KeyMap
        keymap[key] = true
      }
    } else {
      mappedKeys[path] = value
    }
  }

  return mappedKeys
}

export { sprinkleKeys, flattenKeyedData, unarrayFlattenedDataKeys }
