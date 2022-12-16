import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAsync } from 'react-use'
import { auth, signInAnonymously } from './firebase'
import { playUTCSong, useUTCMusic } from './utcMusic'
import { log } from './utils'
import { db_getPlayer, db_setPlayer } from './ZzDB'
import { DB_Player } from './ZzDBTypes'
import Game from './ZzGame'
import LoadingScreen from './ZzLoadingScreen'
import StartScreen from './ZzStartScreen'
import { reverseVoiceLookup } from './ZzTTS'

// function useFlatTire() {
//   const ft = useMemo(() => new FlatTire<Database>(), [])
//   const [db, setDB] = useState(ft.db)

//   const putDB = (...[db, options]: Parameters<typeof ft['put']>) => {
//     ft.put(db, options)
//     setDB(ft.db)
//   }

//   return [db, putDB] as const
// }

function App() {
  // const [db, putDB] = useFlatTire()
  const [appState, setAppState] = useState<'start_screen' | 'game' | null>(null)
  const [myPlayer, setMyPlayer] = useState<DB_Player | null>(null)

  const { value: myId } = useAsync(async () => {
    const { user } = await signInAnonymously(auth)
    log(`You signed in (${user.uid})`)
    return user.uid
  }, [])

  useAsync(async () => {
    if (!myId) return

    // const db = {
    //   online: {
    //     [myId]: true,
    //   },
    // }
    // sprinkleKeys(db)
    // const dbWithArrayedKeys = flattenKeyedData(db)
    // const flatDB = unarrayFlattenedDataKeys(dbWithArrayedKeys)
    // dbSet(undefined, flatDB)

    // putDB(
    //   {
    //     online: {
    //       [myId]: true,
    //     },
    //   },
    //   {
    //     onNewPath(path) {
    //       onDisconnect(dbRef(path)).remove()
    //     },
    //   },
    // )

    // setAppState('start_screen')

    const db_player = await db_getPlayer(myId)
    setMyPlayer(db_player)

    if (!db_player) setAppState('start_screen')
    else setAppState('game')
  }, [myId])

  useUTCMusic()

  useEffect(() => {
    playUTCSong('O_Come_O_Come_Emmanuel')
  }, [])

  switch (appState) {
    case 'game':
      return myPlayer ? <Game myPlayer={myPlayer} /> : null

    case 'start_screen':
      return (
        <StartScreen
          submitDisabled={!myId}
          onSubmit={customizablePlayer => {
            toast(
              <div>
                You ({customizablePlayer.name}) picked{' '}
                <span style={{ filter: `hue-rotate(${customizablePlayer.sprite_hue_rotate}deg)` }}>
                  {customizablePlayer.sprite_emoji}
                </span>{' '}
                with the {reverseVoiceLookup(customizablePlayer.voice).join(' ')} voice
              </div>,
            )

            const myPlayer: DB_Player = {
              ...customizablePlayer,
              id: myId!,
              exp: 0,
              map_id: 'carousel001',
              party_id: null,
            }

            setMyPlayer(myPlayer)
            db_setPlayer(myPlayer.id, myPlayer)
            setAppState('game')
          }}
        />
      )

    default:
      return <LoadingScreen />
  }
}

export default App
