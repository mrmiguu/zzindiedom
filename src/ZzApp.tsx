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

function App() {
  const [appState, _setAppState] = useState<'start_screen' | 'game' | null>(null)
  const [myPlayer, setMyPlayer] = useState<DB_Player | null>(null)

  const setAppState = async (state: Parameters<typeof _setAppState>[0]) => {
    // _setAppState(null)
    // await sleep(2000)
    _setAppState(state)
  }

  const { value: myId } = useAsync(async () => {
    const { user } = await signInAnonymously(auth)

    log(`You signed in (${user.uid})`)

    return user.uid
  }, [])

  useAsync(async () => {
    if (!myId) return

    const db_player = await db_getPlayer(myId)
    setMyPlayer(db_player)

    if (!db_player) setAppState('start_screen')
    else setAppState('game')
  }, [myId])

  useUTCMusic()

  useEffect(() => {
    playUTCSong('Silent_Night_Instrumental')
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
                </span>
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
