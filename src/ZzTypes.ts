import { CSSProperties } from 'react'
import { DB_ChatMessage, DB_Map, DB_Player, DB_PlayerPosition } from './ZzDBTypes'

type GameState = {
  pieces: { [id: string]: PieceState | EntityState | BeastState | PlayerState }
  updatedAt: number
}

type PieceState = {
  id: string
  x: number
  xTimestamp?: number
  static?: 'foreground' | 'background' | 'item'
  important?: boolean
  className?: string
  disabled?: boolean
  style?: CSSProperties
}

type EntityState = PieceState & {
  sprite: string
  hueRotate?: number
}

type BeastState = EntityState & {
  level: number
}

type PlayerState = BeastState & {
  name: string
}

type EventSetPlayer = { type: 'set_player' } & DB_Player
type EventRemovePlayer = { type: 'remove_player' } & Pick<DB_Player, 'id'>
type EventSetPlayerPosition = { type: 'set_player_position' } & Pick<DB_Player, 'id'> & DB_PlayerPosition
type EventChatMessage = { type: 'chat_message' } & Omit<DB_ChatMessage, 'id'> & { map_id: DB_Map['id'] }
type GameEvent = EventSetPlayer | EventRemovePlayer | EventSetPlayerPosition | EventChatMessage

export type {
  GameState,
  PieceState,
  EntityState,
  BeastState,
  PlayerState,
  EventSetPlayer,
  EventRemovePlayer,
  EventSetPlayerPosition,
  EventChatMessage,
  GameEvent,
}
