import merge from 'deepmerge'
import diff from 'microdiff'
import { Subset } from './types'
import { keys } from './utils'

type NestedData = { [key: string]: any }

type ListenerKeys = {
  [key: string]: 'obj' | 'prim'
}

const getListenerKeys = (deepObj: { [key: string]: any }): ListenerKeys => {
  return keys(deepObj).reduce<ListenerKeys>(
    (vdbKeys, key) => ({ ...vdbKeys, [key]: typeof deepObj[key] === 'object' ? 'obj' : 'prim' }),
    {},
  )
}

const putFlatDatabase = <DB extends NestedData>(subset: Subset<DB>, path = '', flatDB: NestedData = {}) => {
  const vdbKeys = getListenerKeys(subset)
  const keysPath = `${path}__keys`

  flatDB[keysPath] = merge(vdbKeys, flatDB[keysPath] ?? {})

  for (const key in vdbKeys) {
    const keyType = vdbKeys[key]!
    const value = subset[key]!
    const nextPath = path ? `${path}__${key}` : key

    if (keyType === 'prim') {
      flatDB[nextPath] = value
    }
    if (keyType === 'obj') {
      putFlatDatabase(value, nextPath, flatDB)
    }
  }
}

class FlatTire<DB extends NestedData> {
  private flatDB = { __keys: {} }

  public db: Subset<DB> = {}

  put = (subset: Subset<DB>) => {
    const newDB = merge(this.db as any, subset as any) as DB
    const diffs = diff(this.db, newDB)[0]
    diffs
    this.db = newDB
    putFlatDatabase(newDB, '', this.flatDB)
  }

  getDatabase = () => this.db
  getFlatDatabase = () => this.flatDB
}

export default FlatTire
