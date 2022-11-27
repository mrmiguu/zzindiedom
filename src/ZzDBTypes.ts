type DB_Player = {
  name: string
  sprite_emoji: string
  exp: number
  map_id: string
  party_id: string | null
}
type DB_PlayerItems = {
  item_counts: { [item_emoji: string]: number }
}
type DB_PlayerFriends = {
  players: { [player_id: string]: true }
}

type DB_MapPlayer = {
  x: number
}
type DB_MapChatMessage = {
  player_id: string
  msg: string
  timestamp: string
}
type DB_Map = {
  name: string
  players: { [player_id: string]: DB_MapPlayer }
  chat_messages: { [message_id: string]: DB_MapChatMessage }
}

type DB_Party = {
  players: { [player_id: string]: true }
}

type DB_Quest = {
  players_stage: { [player_id: string]: number }
}

type DB = {
  players: { [player_id: string]: DB_Player }
  player_items: { [player_id: string]: DB_PlayerItems }
  player_friends: { [player_id: string]: DB_PlayerFriends }

  maps: { [map_id: string]: DB_Map }

  quests: { [quest_id: string]: DB_Quest }

  parties: { [party_id: string]: DB_Party }
}

export type {
  DB_Player,
  DB_PlayerItems,
  DB_PlayerFriends,
  DB_MapPlayer,
  DB_MapChatMessage,
  DB_Map,
  DB_Party,
  DB_Quest,
  DB,
}
