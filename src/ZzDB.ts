import { dbGet, dbListen, dbPushWhileOnline, dbSet, dbSetWhileOnline } from './firebase'
import { DB_ChatMessage, DB_Map, DB_Player, DB_PlayerItems, DB_PlayerPosition } from './ZzDBTypes'

const db_getPlayer = (playerId: string) => dbGet<DB_Player>(`players/${playerId}`)
const db_setPlayer = (playerId: string, player: DB_Player) => dbSet(`players/${playerId}`, player)
const db_playerListener = (playerId: string, onPlayer: (player: DB_Player | null) => void) =>
  dbListen(`players/${playerId}`, onPlayer)
const db_getPlayerItems = (playerId: string) =>
  dbGet<DB_PlayerItems['item_counts']>(`player_items/${playerId}/item_counts`)
const db_setPlayerItemCount = (playerId: string, item: string, count: DB_PlayerItems['item_counts'][string]) =>
  dbSet(`player_items/${playerId}/item_counts/${item}`, count)
const db_getPlayerPosition = (playerId: string) => dbGet<DB_PlayerPosition>(`player_positions/${playerId}`)
const db_setPlayerPosition = (playerId: string, position: DB_PlayerPosition) =>
  dbSet(`player_positions/${playerId}`, position)
const db_getOrSetPlayerPosition = async (playerId: string, defaultPosition: DB_PlayerPosition) => {
  const position = await dbGet<DB_PlayerPosition>(`player_positions/${playerId}`)
  if (!position) dbSet(`player_positions/${playerId}`, defaultPosition)
  return position ?? defaultPosition
}
const db_playerPositionListener = (playerId: string, onPosition: (position: DB_PlayerPosition | null) => void) =>
  dbListen(`player_positions/${playerId}`, onPosition)

const db_getMap = (mapId: string) => dbGet<DB_Map>(`maps/${mapId}`)
const db_setMap = (mapId: string, map: DB_Map) => dbSet(`maps/${mapId}`, map)
const db_setMapPlayerWhileOnline = (mapId: string, playerId: string) =>
  dbSetWhileOnline(`maps/${mapId}/players/${playerId}`, true)
const db_pushMapChatMessageWhileOnline = (mapId: string, msg: Omit<DB_ChatMessage, 'id'>) => {
  const ref = dbPushWhileOnline(`chat_messages`, msg)
  dbSetWhileOnline(`maps/${mapId}/chat_messages/${ref.key!}`, true)
  return ref
}
const db_mapListener = (mapId: string, onMap: (map: DB_Map | null) => void) => dbListen(`maps/${mapId}`, onMap)
const db_mapPlayersListener = (mapId: string, onMapPlayers: (playerIds: DB_Map['players'] | null) => void) =>
  dbListen(`maps/${mapId}/players`, onMapPlayers)
const db_mapChatMessagesListener = (
  mapId: string,
  onMapChatMessage: (chatMessageIds: DB_Map['chat_messages'] | null) => void,
) => dbListen(`maps/${mapId}/chat_messages`, onMapChatMessage)

const db_getChatMessage = (messageId: string) => dbGet<DB_ChatMessage>(`chat_messages/${messageId}`)

export {
  db_getPlayer,
  db_setPlayer,
  db_playerListener,
  db_getPlayerItems,
  db_setPlayerItemCount,
  db_getPlayerPosition,
  db_setPlayerPosition,
  db_getOrSetPlayerPosition,
  db_playerPositionListener,
  db_getMap,
  db_setMap,
  db_setMapPlayerWhileOnline,
  db_pushMapChatMessageWhileOnline,
  db_mapListener,
  db_mapPlayersListener,
  db_mapChatMessagesListener,
  db_getChatMessage,
}
