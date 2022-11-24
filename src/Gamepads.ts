import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { roundGamepadAxes } from './appUtils'

function useGamepads() {
  const ref = useRef<{ [id: string]: Gamepad }>({})
  const [gamepadsAxes, setGamepadsAxes] = useState<{ [index: number]: (-1 | 0 | 1)[] }>({})

  useEffect(() => {
    function onGamepadConnected({ gamepad }: GamepadEvent) {
      ref.current[gamepad.id] = gamepad
      toast(`Player ${gamepad.index + 1} joined`, { icon: '🎮' })
    }

    addEventListener('gamepadconnected', onGamepadConnected)
    return () => {
      removeEventListener('gamepadconnected', onGamepadConnected)
    }
  }, [])

  useEffect(() => {
    let h = 0
    let lastRoundedAxesByIndex: { [index: number]: (-1 | 0 | 1)[] } = {}

    function onFrame() {
      h = requestAnimationFrame(onFrame)

      let someChanged = false

      for (const gamepad of navigator.getGamepads()) {
        if (!gamepad) continue

        const roundedAxes = roundGamepadAxes(gamepad.axes)

        let changed = false
        for (let i = 0; i < roundedAxes.length; i++) {
          if (roundedAxes[i] !== lastRoundedAxesByIndex[gamepad.index]?.[i]) {
            changed = true
            someChanged = true
            break
          }
        }

        if (changed) {
          lastRoundedAxesByIndex[gamepad.index] = roundedAxes
        }
      }

      if (someChanged) setGamepadsAxes({ ...lastRoundedAxesByIndex })
    }

    h = requestAnimationFrame(onFrame)
    return () => {
      cancelAnimationFrame(h)
    }
  }, [])

  useEffect(() => {
    function onGamepadDisconnected({ gamepad }: GamepadEvent) {
      if (gamepad.id in ref.current) {
        delete ref.current[gamepad.id]
        toast(`Player ${gamepad.index + 1} left`, { icon: '🎮' })
      }
    }

    addEventListener('gamepaddisconnected', onGamepadDisconnected)
    return () => {
      removeEventListener('gamepaddisconnected', onGamepadDisconnected)
    }
  }, [])

  return { gamepadsAxes }
}

export { useGamepads }
