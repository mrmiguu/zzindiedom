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

const __keys = '__keys'

const putFlatDatabase = <DB extends NestedData>(subset: Subset<DB>, path = '', flatDB: NestedData = {}) => {
  const vdbKeys = getListenerKeys(subset)
  const keysPath = `${path}${__keys}`

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

type PutOptions = {
  onNewPath: (path: string) => void
}

class FlatTire<DB extends NestedData> {
  private flatDB: NestedData = { [__keys]: {} }

  public db: Subset<DB> = {}

  put = (subset: Subset<DB>, options?: Partial<PutOptions>) => {
    const newDB = merge(this.db as any, subset as any) as DB
    this.db = newDB

    const flatDB: NestedData = {}
    putFlatDatabase(newDB, '', flatDB)

    const flatDiffs = diff(this.flatDB, flatDB)
    for (const diff of flatDiffs) {
      const path = diff.path[0] as string | undefined

      if (diff.type === 'CREATE') {
        if (path && !path?.endsWith(__keys)) {
          options?.onNewPath?.(path)
        }
      }
    }

    this.flatDB = flatDB
  }

  getDatabase = () => this.db
  getFlatDatabase = () => this.flatDB
}

export default FlatTire
