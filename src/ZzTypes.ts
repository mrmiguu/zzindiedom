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

// TODO: deprecate
type InputState = {
  id: string
  userID: string
  type: 'L' | 'R'
  timestamp: number
}
type InputHistory = { [id: string]: InputState }

const GAME_EVENT_TYPES = {
  AddPlayer: 'add_player',
  RemovePlayer: 'remove_player',
  PlayerInput: 'player_input',
} as const

type GameEventType = typeof GAME_EVENT_TYPES

type EventAddPlayer = { type: GameEventType['AddPlayer']; uid: string; name: string; sprite: string; hueRotate: number }
type EventRemovePlayer = { type: GameEventType['RemovePlayer']; uid: string }
type EventPlayerInput = { type: GameEventType['PlayerInput']; uid: string; dir: 'L' | 'R' }
type GameEvent = EventAddPlayer | EventRemovePlayer | EventPlayerInput

type DB_AddPlayerEvents = { [uuid: string]: EventAddPlayer }
type DB_RemovePlayerEvents = { [uuid: string]: EventRemovePlayer }
type DB_PlayerInputEvents = { [uuid: string]: EventPlayerInput }

export type {
  GameState,
  PieceState,
  EntityState,
  BeastState,
  PlayerState,
  InputState,
  InputHistory,
  EventAddPlayer,
  EventRemovePlayer,
  EventPlayerInput,
  GameEvent,
  GameEventType,
  DB_AddPlayerEvents,
  DB_RemovePlayerEvents,
  DB_PlayerInputEvents,
}
export { GAME_EVENT_TYPES }
