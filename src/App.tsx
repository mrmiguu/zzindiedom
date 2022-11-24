import { useState } from 'react'
import toast from 'react-hot-toast'
import { useUTCMusic } from './utcMusic'
import Game from './ZzGame'
import { PlayerSprite } from './ZzSprites'
import StartScreen from './ZzStartScreen'

function App() {
  const [appState, setAppState] = useState<'start' | 'game'>('start')
  const [me, setMe] = useState<{
    name: string
    sprite: PlayerSprite
    spriteHueShiftDeg: number
  }>()

  useUTCMusic()

  switch (appState) {
    case 'game': {
      return me ? <Game myName={me.name} mySprite={me.sprite} mySpriteHueShiftDeg={me.spriteHueShiftDeg} /> : null
    }
    case 'start': {
      return (
        <StartScreen
          onSubmit={({ playerName, sprite, hueShiftDeg }) => {
            toast(
              <div>
                You ({playerName}) picked <span style={{ filter: `hue-rotate(${hueShiftDeg}deg)` }}>{sprite}</span>
              </div>,
            )
            setMe({ name: playerName, sprite, spriteHueShiftDeg: hueShiftDeg })
            setAppState('game')
          }}
        />
      )
    }
    default: {
      return null
    }
  }
}

export default App
