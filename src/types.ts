import { CSSProperties } from 'react'

type OneZeroOne = -1 | 0 | 1

type XY = {
  x: number
  y: number
}

type Size = {
  w: number
  h: number
}

type Box = XY & Size

type FramePriority = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

type PlayerInput = 'U' | '-U' | 'L' | '-L' | 'D' | '-D' | 'R' | '-R'
type PlayerInputMessageKeyDelimiter = '|'
type PlayerInputMessageKey =
  `${number}${PlayerInputMessageKeyDelimiter}${string}${PlayerInputMessageKeyDelimiter}${PlayerInput}`
type PlayerInputMessage = {
  playerId: string
  frame: number
  input: PlayerInput
}
type PlayerInputQueue = PlayerInputMessage[]
type PlayerInputQueueMap = { [key in PlayerInputMessageKey]: PlayerInputMessage }

type BodyData = Box & {
  id: string
  dir: -1 | 1
  force: XY
  framePriority: FramePriority
  damage: number
  static?: boolean
}

type PlayerMetadata = {
  name: string
  spriteNumber: number
}
type PlayerData = BodyData & PlayerMetadata

type StagePlatformType = 'solid' | 'platform'

type StagePlatformData = BodyData & {
  d: number
  type: StagePlatformType
  htmlClassName?: string
  htmlStyle?: CSSProperties
  htmlChildren?: string
}

export type {
  OneZeroOne,
  XY,
  Size,
  Box,
  FramePriority,
  BodyData,
  PlayerInput,
  PlayerInputMessageKeyDelimiter,
  PlayerInputMessageKey,
  PlayerInputMessage,
  PlayerInputQueue,
  PlayerInputQueueMap,
  PlayerMetadata,
  PlayerData,
  StagePlatformType,
  StagePlatformData,
}
