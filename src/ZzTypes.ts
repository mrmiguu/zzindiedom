import { CSSProperties } from 'react'

type GameState = {
  pieces: { [id: string]: PieceState | EntityState | BeastState | PlayerState }
  updatedAt: number
}

type PieceState = {
  id: string
  i: number
  iTimestamp?: number
  static?: 'foreground' | 'background' // TODO: background is broken
  important?: boolean
  className?: string
  style?: CSSProperties
}

type EntityState = PieceState & {
  sprite: string
  spriteHueShiftDeg: number
}

type BeastState = EntityState & {
  level: number
}

type PlayerState = BeastState & {
  name: string
}

type EventAddPlayer = { type: 'add_player'; uid: string; name: string; sprite: string; hueRotate: number }
type EventRemovePlayer = { type: 'remove_player'; uid: string }
type EventPlayerInput = { type: 'player_input'; uid: string; dir: 'L' | 'R' }
type EventPlayerChat = {
  type: 'player_chat'
  uid: string
  name: string
  sprite: string
  hueRotate: number
  msg: string
}
type GameEvent = EventAddPlayer | EventRemovePlayer | EventPlayerInput | EventPlayerChat

export type {
  GameState,
  PieceState,
  EntityState,
  BeastState,
  PlayerState,
  EventAddPlayer,
  EventRemovePlayer,
  EventPlayerInput,
  EventPlayerChat,
  GameEvent,
}
