import { get, push, ref } from 'firebase/database'
import { db, dbGet, dbListen, dbSet } from './firebase'
import { DB_Map, DB_Player } from './ZzDBTypes'

const db_getPlayer = (playerId: string) => dbGet<DB_Player>(`players/${playerId}`)
const db_setPlayer = (playerId: string, player: DB_Player) => dbSet(`players/${playerId}`, player)

const getOrCreateMap = async (mapId: string, defaultMap: DB_Map): Promise<[mapId: string, map: DB_Map]> => {
  const mapRef = ref(db, `maps/${mapId}`)
  const mapSnapshot = await get(mapRef)

  // let mapId = mapSnapshot.key
  let map: DB_Map | null = mapSnapshot.val()

  if (!map) {
    const newMapRef = await push(mapRef, defaultMap)
    newMapRef.key!
    map = defaultMap
  }

  return [mapId, map]
}

const playerListener = (playerId: string, onPlayer: (player: DB_Player) => void) =>
  dbListen(`players/${playerId}`, onPlayer)

// function useDBGameEvents<E extends GameEvent>(path: E['type'], onEvent: (event: E) => void) {
//   type DB_GameEvents = { [uuid: string]: E }

//   const uid = getCurrentUserID()

//   const gameEventsRef = useRef<DB_GameEvents>({})
//   const [addedGameEvents, setAddedGameEvents] = useState<DB_GameEvents>({})

//   useEffect(() => {
//     return dbListen<DB_GameEvents>(path, gameEvents => {
//       setAddedGameEvents(diff(gameEventsRef.current, gameEvents) as DB_GameEvents)
//       gameEventsRef.current = gameEvents
//     })
//   }, [path])

//   useEffect(() => {
//     for (const uuid in addedGameEvents) {
//       const addedGameEvent = addedGameEvents[uuid]!
//       if (addedGameEvent.uid !== uid) onEvent(addedGameEvent)
//     }
//   }, [uid, addedGameEvents])

//   return {
//     addedGameEvents,
//     gameEvents: gameEventsRef.current,
//   }
// }

export { db_getPlayer, db_setPlayer /* , useDBGameEvents */ }
