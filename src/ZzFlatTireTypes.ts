type PlayerData = {
  id: string
  name: string
  spriteEmoji: string
  hueRotate: number
  exp: number
  x: number
  items: {
    [item: string]: number
  }
  mapId: string
}

type MapData = {
  playerIds: {
    [id: string]: true
  }
  chatMessageIds: {
    [id: string]: true
  }
}

type ChatMessageData = {
  id: string
  playerId: string
  msg: string
  timestamp: string
}

type Database = {
  online: {
    [playerId: string]: true
  }

  players: {
    [id: string]: PlayerData
  }

  maps: {
    [id: string]: MapData
  }

  chatMessages: {
    [id: string]: ChatMessageData
  }
}

export type { PlayerData, MapData, ChatMessageData, Database }
