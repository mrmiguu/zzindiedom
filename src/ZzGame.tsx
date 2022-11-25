import { diff } from 'deep-object-diff'
import produce, { enablePatches } from 'immer'
import { Reducer, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import useWindowSize from 'react-use/lib/useWindowSize'

import { dbListen, dbPush, dbRef, dbSet } from './firebase'
import { clampN } from './math'
import sounds from './sounds'
import { setUTCSong } from './utcMusic'
import { max, min, pickRandom, random, values } from './utils'
import ChatDrawer from './ZzChatDrawer'
import { useDBGameEvents } from './ZzDB'
import LRScreen from './ZzLRScreen'
import PieceBadge from './ZzPieceBadge'
import { cityScenerySprites, PlayerSprite, playerSprites } from './ZzSprites'
import TileCarousel from './ZzTileCarousel'
import {
  DB_AddPlayerEvents,
  EventAddPlayer,
  EventPlayerInput,
  EventRemovePlayer,
  GameEvent,
  GameState,
  GAME_EVENT_TYPES,
  InputHistory,
  InputState,
  PieceState,
} from './ZzTypes'

enablePatches()

type GameProps = {
  myID: string
  myName: string
  mySprite: PlayerSprite
  mySpriteHueShiftDeg: number
}

function Game({ myID, myName, mySprite, mySpriteHueShiftDeg }: GameProps) {
  const mapID = 'carousel001'
  const perspective = 1024
  const cameraAngle = 75
  const tiles = 64

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
    const seed = `${mapID}:cpuPieces`

    return cpuIDs.reduce<{ [id: string]: PieceState }>(
      (pieces, id) => ({
        ...pieces,
        [id]: {
          id,
          sprite: pickRandom(playerSprites, { seed }),
          spriteHueShiftDeg: 360 * random({ seed }),
          i: ~~(tiles * random({ seed })),
          iTimestamp: 0,
        },
      }),
      {},
    )
  }, [cpuIDs, tiles, mapID])

  const sceneryPieces = useMemo(() => {
    const seed = `${mapID}:sceneryPieces`

    return sceneryIDs.reduce<{ [id: string]: PieceState }>(
      (pieces, id) => ({
        ...pieces,
        [id]: {
          id,
          sprite: pickRandom(cityScenerySprites, { seed }),
          spriteHueShiftDeg: 0,
          i: 1 + ~~((tiles - 1) * random({ seed })),
          static: random({ seed }) < 0.5 ? 'background' : 'foreground',
        },
      }),
      {},
    )
  }, [sceneryIDs, tiles, mapID])

  const [gameState, fireLocalGameEvent] = useReducer<Reducer<GameState, GameEvent>>(
    (state, event) => {
      switch (event.type) {
        case 'add_player':
          return produce(state, state => {
            state.pieces[event.uid] = {
              id: event.uid,
              name: event.name,
              level: 1,
              sprite: event.sprite,
              spriteHueShiftDeg: event.hueRotate,
              i: 0,
              iTimestamp: 0,
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
                target.i--
                target.iTimestamp = Date.now()
              }
              if (event.dir === 'R') {
                sounds.dash.then(s => s.play())
                target.i++
                target.iTimestamp = Date.now()
              }
            }

            for (const id in state.pieces) {
              const piece = state.pieces[id]!
              if (piece.id === target.id) continue
              if (clampN(piece.i, tiles) !== clampN(target.i, tiles)) continue
              // toast('💥')
              // delete state.pieces[id]
            }
          })
        default:
          throw new Error()
      }
    },
    {
      pieces: {
        ...cpuPieces,
        ...sceneryPieces,
        warp001: {
          id: 'warp001',
          i: 2,
          static: 'foreground',
          className: 'w-16 h-20 rounded-full border border-yellow-500 bg-blue-500/50 animate-pulse',
        },
      },
      updatedAt: 0,
    },
  )
  const fireGlobalGameEvent = async (event: GameEvent) => {
    fireLocalGameEvent(event)
    await dbPush(event.type, event)
  }

  const { pieces } = gameState

  useEffect(() => {
    fireGlobalGameEvent({
      type: 'add_player',
      uid: myID,
      name: myName,
      sprite: mySprite,
      hueRotate: mySpriteHueShiftDeg,
    })
    return () => {
      fireGlobalGameEvent({ type: 'remove_player', uid: myID })
    }
  }, [myID, myName, mySprite, mySpriteHueShiftDeg])

  const windowSize = useWindowSize(innerWidth, innerHeight)

  setUTCSong('LEMON_CAKE')

  const bgLayer = (
    <div className="absolute w-full h-full bg-gradient-to-b from-[#36D6ED] to-[#C8F6FF] pointer-events-none" />
  )

  const sendChat = (uid: string, sprite: PlayerSprite, spriteHueShiftDeg: number, name: string, msg: string) => {
    const wordsPerSec = 2
    const duration = (1000 * max(5, msg.split(' ').length)) / wordsPerSec

    const myMsg = uid === myID

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

  const startAI = useCallback(
    (aiID: string) => {
      const seed = `${mapID}:startAI`

      const msRandom = () => 1000 * (2 + (5 - 2) * random({ seed }))

      let timeoutID: NodeJS.Timeout
      const ai = () => {
        timeoutID = setTimeout(ai, msRandom())
        fireLocalGameEvent({ type: 'player_input', uid: aiID, dir: random({ seed }) < 0.5 ? 'L' : 'R' })
      }
      timeoutID = setTimeout(ai, msRandom())

      return () => clearTimeout(timeoutID)
    },
    [mapID],
  )

  useEffect(() => {
    cpuIDs.forEach(startAI)
  }, [cpuIDs, startAI])

  const myPiece = pieces[myID]

  const zIndexes = useMemo(
    () =>
      values(pieces)
        .filter(p => !p.static)
        .sort((a, b) => {
          const di = clampN(a.i, tiles) - clampN(b.i, tiles)
          return di === 0 ? (a.iTimestamp ?? 0) - (b.iTimestamp ?? 0) : di
        }),
    [pieces],
  )

  const myZIndex = zIndexes.findIndex(p => p.id === myID)
  const neighborRadius = 2
  const entityNeighbors = myPiece
    ? zIndexes
        .slice(
          max(0, clampN(myZIndex, tiles) - neighborRadius),
          min(zIndexes.length, clampN(myZIndex, tiles) + (neighborRadius + 1)),
        )
        .filter(
          p =>
            clampN(p.i, tiles) >= clampN(myPiece.i, tiles) - neighborRadius &&
            clampN(p.i, tiles) <= clampN(myPiece.i, tiles) + neighborRadius,
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
              sendChat(myID, mySprite, mySpriteHueShiftDeg, myName, msg)
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
        <button className="pointer-events-auto" onClick={() => setShowChatDrawer(true)}>
          💬
        </button>
      </div>
    </div>
  )

  useDBGameEvents<EventAddPlayer>('add_player', event => {
    fireLocalGameEvent({
      type: event.type,
      uid: event.uid,
      name: event.name,
      sprite: event.sprite,
      hueRotate: event.hueRotate,
    })
  })
  useDBGameEvents<EventPlayerInput>('player_input', event => {
    fireLocalGameEvent({
      type: event.type,
      uid: event.uid,
      dir: event.dir,
    })
  })
  useDBGameEvents<EventRemovePlayer>('remove_player', event => {
    fireLocalGameEvent({
      type: event.type,
      uid: event.uid,
    })
  })

  const onTouch = (dir: EventPlayerInput['dir']) => async () => {
    fireGlobalGameEvent({ type: 'player_input', uid: myID, dir })
  }

  const LRtouchLayer = <LRScreen onL={onTouch('L')} onR={onTouch('R')} />

  return (
    <div className="absolute w-full h-full overflow-hidden" style={{ perspective: `${perspective}px` }}>
      {bgLayer}
      <TileCarousel
        iCamera={myPiece?.i ?? 0}
        cameraAngle={cameraAngle}
        tiles={tiles}
        pieces={pieces}
        zIndexes={zIndexes}
      />
      {LRtouchLayer}
      {badgesLayer}
      {sideButtonsLayer}
      {chatDrawerLayer}
    </div>
  )
}

export default Game
