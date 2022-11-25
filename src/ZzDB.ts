import { diff } from 'deep-object-diff'
import { useEffect, useRef, useState } from 'react'
import { dbListen, getCurrentUserID } from './firebase'
import { GameEvent } from './ZzTypes'

function useDBGameEvents<E extends GameEvent>(path: E['type'], onEvent: (event: E) => void) {
  type DB_GameEvents = { [uuid: string]: E }

  const uid = getCurrentUserID()

  const gameEventsRef = useRef<DB_GameEvents>({})
  const [addedGameEvents, setAddedGameEvents] = useState<DB_GameEvents>({})
  useEffect(() => {
    return dbListen<DB_GameEvents>(path, gameEvents => {
      setAddedGameEvents(diff(gameEventsRef.current, gameEvents) as DB_GameEvents)
      gameEventsRef.current = gameEvents
    })
  }, [path])

  useEffect(() => {
    for (const uuid in addedGameEvents) {
      const addedGameEvent = addedGameEvents[uuid]!
      if (addedGameEvent.uid !== uid) onEvent(addedGameEvent)
    }
  }, [uid, addedGameEvents])

  return {
    addedGameEvents,
    gameEvents: gameEventsRef.current,
  }
}

export { useDBGameEvents }
