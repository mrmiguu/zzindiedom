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

type InputState = {
  id: string
  targetID: string
  type: 'L' | 'R'
  timestamp: number
}

type InputHistory = { [id: string]: InputState }

export type { GameState, PieceState, EntityState, BeastState, PlayerState, InputState, InputHistory }
