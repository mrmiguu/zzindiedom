import { diff } from 'deep-object-diff'
import { useEffect, useRef, useState } from 'react'
import { dbListen, getCurrentUserID } from './firebase'
import { keys } from './utils'
import { GameEvent } from './ZzTypes'

function useDBOnlineList() {
  type DB_OnlineList = { [uid: string]: true }

  const uid = getCurrentUserID()

  const onlineListRef = useRef<DB_OnlineList>(uid ? { [uid]: true } : {})
  const [newlyOnline, setNewlyOnline] = useState<string[]>([])

  useEffect(() => {
    dbListen<DB_OnlineList>('online', onlineList => {
      setNewlyOnline(keys(diff(onlineListRef.current, onlineList)).filter(id => id !== uid))
      onlineListRef.current = onlineList
    })
  }, [])

  return {
    newlyOnline,
    onlineList: onlineListRef.current,
  }
}

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

export { useDBGameEvents, useDBOnlineList }
