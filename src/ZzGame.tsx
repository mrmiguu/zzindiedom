import produce, { enablePatches } from 'immer'
import { Reducer, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { toast } from 'react-hot-toast'
import useWindowSize from 'react-use/lib/useWindowSize'

import { clampN } from './math'
import sounds from './sounds'
import { playUTCSong } from './utcMusic'
import { max, min, pickRandom, random, values } from './utils'
import ChatDrawer from './ZzChatDrawer'
import { DB_Player } from './ZzDBTypes'
import LRScreen from './ZzLRScreen'
import PieceBadge from './ZzPieceBadge'
import { cityScenerySprites, playerSprites } from './ZzSprites'
import TileCarousel from './ZzTileCarousel'
import { EventPlayerInput, GameEvent, GameState, PieceState } from './ZzTypes'

enablePatches()

type GameProps = { myPlayer: DB_Player }

function Game({ myPlayer }: GameProps) {
  const mapId = myPlayer.map_id
  const perspective = 1024
  const cameraAngle = 75
  const tiles = 64

  const windowSize = useWindowSize(innerWidth, innerHeight)

  const cpuIDs = useMemo(
    () =>
      [
        /* ...Array(~~(tiles * 0.2)) */
      ].map((_, i) => `cpu${`${i}`.padStart(3, '0')}`),
    [tiles],
  )

  const sceneryIDs = useMemo(
    () => [...Array(~~(tiles * 0.2))].map((_, i) => `scenery${`${i}`.padStart(3, '0')}`),
    [tiles],
  )

  const cpuPieces = useMemo(() => {
    const seed = `${mapId}:cpuPieces`

    return cpuIDs.reduce<{ [id: string]: PieceState }>(
      (pieces, id) => ({
        ...pieces,
        [id]: {
          id,
          sprite: pickRandom(playerSprites, { seed }),
          spriteHueShiftDeg: 360 * random({ seed }),
          x: ~~(tiles * random({ seed })),
          xTimestamp: 0,
        },
      }),
      {},
    )
  }, [cpuIDs, tiles, mapId])

  const sceneryPieces = useMemo(() => {
    const seed = `${mapId}:sceneryPieces`

    return sceneryIDs.reduce<{ [id: string]: PieceState }>(
      (pieces, id) => ({
        ...pieces,
        [id]: {
          id,
          sprite: pickRandom(cityScenerySprites, { seed }),
          spriteHueShiftDeg: 0,
          x: 1 + ~~((tiles - 1) * random({ seed })),
          static: random({ seed }) < 0.5 ? 'background' : 'foreground',
        },
      }),
      {},
    )
  }, [sceneryIDs, tiles, mapId])

  const sendChat = (uid: string, sprite: string, spriteHueShiftDeg: number, name: string, msg: string) => {
    const wordsPerSec = 2
    const duration = (1000 * max(5, msg.split(' ').length)) / wordsPerSec

    const myMsg = uid === myPlayer.id

    const width = 222
    const msgTheme = myMsg ? 'bg-[#0154CC] text-white' : 'bg-white'
    const translateX = myMsg ? windowSize.width / 2 - width / 2 - 64 : -windowSize.width / 2 + width / 2 + 16

    toast(
      <div
        className={`pointer-events-none ${msgTheme} py-3 px-4 -my-3 rounded-3xl shadow-inner text-xs`}
        style={{ width, transform: `translate(${translateX}px)` }}
      >
        <span style={{ filter: `hue-rotate(${spriteHueShiftDeg}deg)` }}>{sprite}</span> {name}: {msg}
      </div>,
      { className: 'bg-transparent drop-shadow-none shadow-none', duration },
    )
  }

  const [gameState, fireLocalGameEvent] = useReducer<Reducer<GameState, GameEvent>>(
    (state, event) => {
      switch (event.type) {
        case 'add_player':
          return produce(state, state => {
            state.pieces[event.id] = {
              id: event.id,
              name: event.name,
              level: event.exp,
              sprite: event.sprite_emoji,
              spriteHueShiftDeg: event.sprite_hue_rotate,
              x: 0,
              xTimestamp: 0,
            }
          })

        case 'remove_player':
          return produce(state, state => {
            delete state.pieces[event.uid]
          })

        case 'player_input':
          return produce(state, state => {
            const target = state.pieces[event.uid]
            if (!target) return

            if (event.type === 'player_input') {
              if (event.dir === 'L') {
                sounds.dash.then(s => s.play())
                target.x--
                target.xTimestamp = Date.now()
              }
              if (event.dir === 'R') {
                sounds.dash.then(s => s.play())
                target.x++
                target.xTimestamp = Date.now()
              }
            }

            for (const id in state.pieces) {
              const piece = state.pieces[id]!
              if (piece.id === target.id) continue
              if (clampN(piece.x, tiles) !== clampN(target.x, tiles)) continue
              // toast('💥')
              // delete state.pieces[id]
            }
          })

        case 'player_chat':
          sendChat(event.uid, event.sprite, event.hueRotate, event.name, event.msg)
          break

        default:
          throw new Error()
      }

      return state
    },
    {
      pieces: {
        ...cpuPieces,
        ...sceneryPieces,
        warp001: {
          id: 'warp001',
          x: 2,
          static: 'foreground',
          className: 'w-16 h-20 rounded-full border border-yellow-500 bg-blue-500/50 animate-pulse',
        },
      },
      updatedAt: 0,
    },
  )

  useEffect(() => {
    fireLocalGameEvent({ type: 'add_player', ...myPlayer })
  }, [])

  // useDBGameEvents<EventAddPlayer>('add_player', fireLocalGameEvent)
  // useDBGameEvents<EventRemovePlayer>('remove_player', fireLocalGameEvent)
  // useDBGameEvents<EventPlayerInput>('player_input', fireLocalGameEvent)
  // useDBGameEvents<EventPlayerChat>('player_chat', fireLocalGameEvent)

  const fireGlobalGameEvent = async (event: GameEvent) => {
    fireLocalGameEvent(event)
    // dbOnlineOnlyPush(event.type, event)
  }

  const { pieces } = gameState

  useEffect(() => {
    playUTCSong('LEMON_CAKE')
  }, [])

  const bgLayer = (
    <div className="absolute w-full h-full bg-gradient-to-b from-[#36D6ED] to-[#C8F6FF] pointer-events-none" />
  )

  const startAI = useCallback(
    (aiID: string) => {
      const seed = `${mapId}:startAI`

      const msRandom = () => 1000 * (2 + (5 - 2) * random({ seed }))

      let timeoutID: NodeJS.Timeout
      const ai = () => {
        timeoutID = setTimeout(ai, msRandom())
        fireLocalGameEvent({ type: 'player_input', uid: aiID, dir: random({ seed }) < 0.5 ? 'L' : 'R' })
      }
      timeoutID = setTimeout(ai, msRandom())

      return () => clearTimeout(timeoutID)
    },
    [mapId],
  )

  useEffect(() => {
    cpuIDs.forEach(startAI)
  }, [cpuIDs, startAI])

  const myPiece = pieces[myPlayer.id]

  const zIndexes = useMemo(
    () =>
      values(pieces)
        .filter(p => !p.static)
        .sort((a, b) => {
          const di = clampN(a.x, tiles) - clampN(b.x, tiles)
          return di === 0 ? (a.xTimestamp ?? 0) - (b.xTimestamp ?? 0) : di
        }),
    [pieces],
  )

  const myZIndex = zIndexes.findIndex(p => p.id === myPlayer.id)
  const neighborRadius = 2
  const entityNeighbors = myPiece
    ? zIndexes
        .slice(
          max(0, clampN(myZIndex, tiles) - neighborRadius),
          min(zIndexes.length, clampN(myZIndex, tiles) + (neighborRadius + 1)),
        )
        .filter(
          p =>
            clampN(p.x, tiles) >= clampN(myPiece.x, tiles) - neighborRadius &&
            clampN(p.x, tiles) <= clampN(myPiece.x, tiles) + neighborRadius,
        )
    : []

  const badgesLayer = (
    <div className="absolute flex items-end justify-center w-full h-full pointer-events-none">
      <div className="flex gap-3 p-4">
        {entityNeighbors.map(
          entity =>
            'sprite' in entity && (
              <PieceBadge
                key={entity.id}
                size={12}
                sprite={entity.sprite}
                spriteHueShiftDeg={entity.spriteHueShiftDeg}
                onClick={
                  'name' in entity
                    ? () => {
                        const filter = `hue-rotate(${entity.spriteHueShiftDeg}deg)`
                        toast(
                          <div>
                            <div>
                              <span style={{ filter }}>{entity.sprite}</span> {entity.name}
                            </div>
                            <div>Lv. {entity.level}</div>
                          </div>,
                        )
                      }
                    : undefined
                }
              />
            ),
        )}
      </div>
    </div>
  )

  const [showChatDrawer, setShowChatDrawer] = useState(false)
  const chatDrawerLayer = (
    <div
      className={`absolute flex items-end justify-center w-full h-full overflow-hidden ${
        showChatDrawer ? 'cursor-pointer' : 'pointer-events-none'
      }`}
      onClick={() => setShowChatDrawer(false)}
    >
      <div className="relative w-full transition-transform ease-linear" onClick={e => e.stopPropagation()}>
        {showChatDrawer && (
          <ChatDrawer
            onSubmit={({ msg }) => {
              fireGlobalGameEvent({
                type: 'player_chat',
                uid: myPlayer.id,
                sprite: myPlayer.sprite_emoji,
                hueRotate: myPlayer.sprite_hue_rotate,
                name: myPlayer.name,
                msg,
              })
            }}
            onEsc={() => setShowChatDrawer(false)}
          />
        )}
      </div>
    </div>
  )

  const sideButtonsLayer = (
    <div className="absolute flex items-end justify-end w-full h-full pointer-events-none">
      <div className="flex flex-col gap-3 px-4 py-20 text-4xl">
        <button
          className="pointer-events-auto hover:opacity-90 active:animate-ping"
          onMouseDown={e => sounds.button.then(s => s.play())}
          onClick={() => setShowChatDrawer(true)}
        >
          💬
        </button>
      </div>
    </div>
  )

  const onTouch = (dir: EventPlayerInput['dir']) => async () => {
    fireGlobalGameEvent({ type: 'player_input', uid: myPlayer.id, dir })
  }

  const LRtouchLayer = <LRScreen onL={onTouch('L')} onR={onTouch('R')} />

  const tileCarousel = (
    <TileCarousel
      iCamera={myPiece?.x ?? 0}
      cameraAngle={cameraAngle}
      tiles={tiles}
      pieces={pieces}
      zIndexes={zIndexes}
    />
  )

  return (
    <div className="absolute w-full h-full overflow-hidden" style={{ perspective: `${perspective}px` }}>
      {bgLayer}
      {tileCarousel}
      {LRtouchLayer}
      {badgesLayer}
      {sideButtonsLayer}
      {chatDrawerLayer}
    </div>
  )
}

export default Game
