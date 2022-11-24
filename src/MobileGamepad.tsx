import produce from 'immer'
import { createRef, RefObject, useEffect, useMemo, useRef, useState } from 'react'
import usePrevious from 'react-use/lib/usePrevious'
import { roundGamepadAxes } from './appUtils'
import { joystickPxRange } from './consts'
import { OneZeroOne } from './types'
import { atan2, cos, entries, keys, max, min, sin, sleep, sqrt } from './utils'

let axesSingleton: { [id: number]: readonly [number, number] } = undefined as any

function useMobileJoysticks() {
  const [mobileJoysticks, setMobileJoysticks] = useState<{ [id: number]: [OneZeroOne, OneZeroOne] }>({})

  useEffect(() => {
    let h = 0
    let lastRoundedAxesByIndex: { [id: number]: [OneZeroOne, OneZeroOne] } = {}

    function onFrame() {
      h = requestAnimationFrame(onFrame)

      const roundedAxesByIndex: { [id: number]: [OneZeroOne, OneZeroOne] } = {}
      let someChanged = false

      for (const id in axesSingleton) {
        const axis = axesSingleton[id]!

        const roundedAxes = roundGamepadAxes(axis, joystickPxRange) as [OneZeroOne, OneZeroOne]

        let changed = false
        for (let i = 0; i < roundedAxes.length; i++) {
          if (roundedAxes[i] !== lastRoundedAxesByIndex[id]?.[i]) {
            changed = true
            someChanged = true
            break
          }
        }

        if (changed) {
          lastRoundedAxesByIndex[id] = roundedAxes
          roundedAxesByIndex[id] = roundedAxes
        }
      }

      if (someChanged) setMobileJoysticks({ ...roundedAxesByIndex })
    }

    h = requestAnimationFrame(onFrame)
    return () => {
      cancelAnimationFrame(h)
    }
  }, [])

  return { mobileJoysticks }
}

function MobileGamepad() {
  const [touches, setTouches] = useState<{
    [id: number]: { ref: RefObject<HTMLDivElement>; start: readonly [number, number]; timestamp: number }
  }>({})

  const touchXYRefs = useRef<{ [id: number]: readonly [number, number] }>({})

  const axesRef = useRef<{ [id: number]: readonly [number, number] }>({})
  axesSingleton = axesRef.current

  const touchIds = keys(touches)
  const previousTouchIds = usePrevious(touchIds) ?? []
  const diffTouchIds = useMemo(() => touchIds.filter(x => !previousTouchIds.includes(x)), [touches]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      e.preventDefault()

      setTouches(touches => {
        let newTouches = { ...touches }

        for (let i = 0; i < e.changedTouches.length; i++) {
          const { identifier: id, pageX: x, pageY: y } = e.changedTouches[i]!

          const ref = touches[id]?.ref ?? createRef()
          const start = [x, y] as const
          const timestamp = Date.now()

          newTouches[id] = { ref, start, timestamp }

          touchXYRefs.current[id] = start
        }

        return newTouches
      })
    }

    addEventListener('touchstart', onTouchStart, { passive: false })

    return () => {
      removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  useEffect(
    function effectTouchMove() {
      function onTouchMove(e: TouchEvent) {
        e.preventDefault()

        for (let i = 0; i < e.changedTouches.length; i++) {
          const { identifier: id, pageX: x, pageY: y } = e.changedTouches[i]!

          if (!(id in touches)) continue

          const {
            ref,
            start: [x1, y1],
          } = touches[id]!

          const touchDiv = ref.current!
          const startDotDiv = touchDiv.querySelector<HTMLDivElement>('#startDot')!
          const dotDiv = touchDiv.querySelector<HTMLDivElement>('#dot')!

          startDotDiv.style.transform = `translate(${x1}px,${y1}px)`
          startDotDiv.style.opacity = '1'

          const dx = x - x1
          const dy = y - y1
          const rad = atan2(dy, dx)
          const c = sqrt(dx ** 2 + dy ** 2)
          const cappedR = max(-joystickPxRange, min(joystickPxRange, c))
          const cappedDX = cos(rad) * cappedR
          const cappedDY = sin(rad) * cappedR
          const cappedX = x1 + cappedDX
          const cappedY = y1 + cappedDY

          dotDiv.style.transform = `translate(${cappedX}px,${cappedY}px)`

          touchXYRefs.current[id] = [cappedX, cappedY]
          axesRef.current[id] = [cappedDX, cappedDY]
        }
      }

      addEventListener('touchmove', onTouchMove, { passive: false })

      return () => {
        removeEventListener('touchmove', onTouchMove)
      }
    },
    [touches],
  )

  useEffect(() => {
    function onTouchEnd(e: TouchEvent) {
      e.preventDefault()

      setTouches(
        produce(touches => {
          for (let i = 0; i < e.changedTouches.length; i++) {
            const id = e.changedTouches[i]!.identifier
            delete touches[id]
            delete touchXYRefs.current[id]

            axesRef.current[id] = [0, 0]

            // cleanup 1-frame later so our last touch event isn't left hanging
            sleep(1000 / 60).then(() => delete axesRef.current[id])
          }
        }),
      )
    }

    addEventListener('touchend', onTouchEnd, { passive: false })

    return () => {
      removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  useEffect(() => {
    for (const id of diffTouchIds) {
      const {
        ref,
        start: [x, y],
      } = touches[Number(id)]!

      const touchDiv = ref.current!
      const dotDiv = touchDiv.querySelector<HTMLDivElement>('#dot')!

      dotDiv.style.transform = `translate(${x}px,${y}px)`
      touchXYRefs.current[Number(id)] = [x, y]
    }
  }, [diffTouchIds]) // eslint-disable-line react-hooks/exhaustive-deps

  const touchDots = entries(touches).map(
    ([
      id,
      {
        ref,
        start: [x1, y1],
      },
    ]) => {
      const [x, y] = touchXYRefs.current[Number(id)] ?? [0, 0]

      const startDot = (
        <div
          id="startDot"
          className="absolute top-0 left-0 grid content-center opacity-0 pointer-events-none justify-items-center"
          style={{ transform: `translate(${x1}px,${y1}px)` }}
        >
          <div className={`absolute left-0 top-0 w-7 h-7 transform -translate-x-1/2 -translate-y-1/2`}>
            <div className={`w-full h-full rounded-full bg-black animate-pulse`} />
          </div>
        </div>
      )

      const dot = (
        <div
          id="dot"
          className="absolute top-0 left-0 grid content-center pointer-events-none justify-items-center"
          style={{ transform: `translate(${x}px,${y}px)` }}
        >
          <div className={`absolute left-0 top-0 w-20 h-20 transform -translate-x-1/2 -translate-y-1/2`}>
            <div
              className={`w-full h-full rounded-full bg-black animate-ping opacity-50`}
              style={{ animationIterationCount: 1 }}
            />
          </div>
        </div>
      )

      return (
        <div key={id} ref={ref}>
          {startDot}
          {dot}
        </div>
      )
    },
  )

  return (
    <div className="fixed flex items-center justify-center w-full h-full">
      <div className="w-1/2 h-1/2">{touchDots}</div>
      {/* <pre className="absolute top-0 left-0">{stringify(axesRef.current, null, 2)}</pre> */}
    </div>
  )
}

export default MobileGamepad
export { useMobileJoysticks }
