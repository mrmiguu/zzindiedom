import { Voice } from "./ZzTTS"

type DB_Player = {
  id: string
  name: string
  sprite_emoji: string
  sprite_hue_rotate: number
  voice: Voice
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
type DB_PlayerPosition = {
  x: number
}

type DB_Map = {
  id: string
  players: { [player_id: string]: true }
  chat_messages: { [message_id: string]: true }
}

type DB_ChatMessage = {
  id: string
  player_id: string
  msg: string
  timestamp: string
}

type DB_Party = {
  id: string
  players: { [player_id: string]: true }
}

type DB_Quest = {
  id: string
  players_stage: { [player_id: string]: number }
}

type DB = {
  players: { [player_id: string]: DB_Player }
  player_items: { [player_id: string]: DB_PlayerItems }
  player_friends: { [player_id: string]: DB_PlayerFriends }
  player_positions: { [player_id: string]: DB_PlayerPosition }

  maps: { [map_id: string]: DB_Map }

  chat_messages: { [message_id: string]: DB_ChatMessage }

  quests: { [quest_id: string]: DB_Quest }

  parties: { [party_id: string]: DB_Party }
}

export type {
  DB_Player,
  DB_PlayerItems,
  DB_PlayerFriends,
  DB_PlayerPosition,
  DB_Map,
  DB_ChatMessage,
  DB_Quest,
  DB_Party,
  DB,
}
