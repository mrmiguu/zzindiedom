type KeyArray = string[]
type KeyMap = { [key: string]: true }

type FlatValue = string | number | boolean
type FlatValueOrKeyArray = FlatValue | KeyArray
type FlatValueOrKeyMap = FlatValue | KeyMap

export type { KeyArray, KeyMap, FlatValue, FlatValueOrKeyArray, FlatValueOrKeyMap }
