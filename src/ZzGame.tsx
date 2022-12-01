import produce, { enablePatches } from 'immer'
import diff from 'microdiff'
import { Reducer, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAsync } from 'react-use'
import useWindowSize from 'react-use/lib/useWindowSize'

import { clampN } from './math'
import sounds from './sounds'
import { playUTCSong } from './utcMusic'
import { keys, log, max, min, pickRandom, random, stringify, values } from './utils'
import ChatDrawer from './ZzChatDrawer'
import {
  db_getChatMessage,
  db_getOrSetPlayerPosition,
  db_mapChatMessagesListener,
  db_mapPlayersListener,
  db_playerListener,
  db_playerPositionListener,
  db_pushMapChatMessageWhileOnline,
  db_setMapPlayerWhileOnline,
  db_setPlayerPosition,
} from './ZzDB'
import { DB, DB_Map, DB_Player } from './ZzDBTypes'
import LRScreen from './ZzLRScreen'
import PieceBadge from './ZzPieceBadge'
import { cityScenerySprites, playerSprites } from './ZzSprites'
import TileCarousel from './ZzTileCarousel'
import { GameEvent, GameState, PieceState } from './ZzTypes'

enablePatches()

type GameProps = { myPlayer: DB_Player }

function Game({ myPlayer }: GameProps) {
  const myId = myPlayer.id
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

    const myMsg = uid === myId

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
        case 'set_player':
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
            delete state.pieces[event.id]
          })

        case 'set_player_position':
          return produce(state, state => {
            const target = state.pieces[event.id]
            if (!target) return

            sounds.dash.then(s => s.play())
            target.x = event.x
            target.xTimestamp = Date.now()

            // for (const id in state.pieces) {
            //   const piece = state.pieces[id]!
            //   if (piece.id === target.id) continue
            //   if (clampN(piece.x, tiles) !== clampN(target.x, tiles)) continue
            //   // toast('💥')
            //   // delete state.pieces[id]
            // }
          })

        case 'chat_message':
          const piece = state.pieces[event.player_id]
          if (piece && 'sprite' in piece && 'spriteHueShiftDeg' in piece && 'name' in piece) {
            sendChat(event.player_id, piece.sprite, piece.spriteHueShiftDeg, piece.name, event.msg)
          }
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

  const [mapPlayerIds, setMapPlayerIds] = useState<DB_Map['players']>({})

  useAsync(async () => {
    db_setMapPlayerWhileOnline(mapId, myId)

    const unsub_mapPlayersListener = db_mapPlayersListener(mapId, newIds => {
      setMapPlayerIds(oldIds => {
        const ops = diff(oldIds, newIds ?? {})

        const deleteOps = ops.filter(op => op.type === 'REMOVE')
        for (const op of deleteOps) {
          const id = op.path[0]! as string
          fireLocalGameEvent({ type: 'remove_player', id })
        }

        return newIds ?? {}
      })
    })

    fireLocalGameEvent({ type: 'set_player', ...myPlayer })

    const position = await db_getOrSetPlayerPosition(myId, { x: 0 })
    fireLocalGameEvent({ type: 'set_player_position', id: myId, ...position })

    return () => {
      unsub_mapPlayersListener()
    }
  }, [myId, mapId])

  const chatMessagesRef = useRef<DB_Map['chat_messages']>({})
  useAsync(async () => {
    const unsub_mapChatMessagesListener = db_mapChatMessagesListener(mapId, async messageIds => {
      const ops = diff(chatMessagesRef.current, messageIds ?? {})
      chatMessagesRef.current = messageIds ?? {}

      const addedOps = ops.filter(op => op.type === 'CREATE')
      const newMessageIds = addedOps.map(({ path }) => path[0] as string)
      const messages = await Promise.all(newMessageIds.map(db_getChatMessage))

      for (const msg of messages) {
        if (!msg || msg.player_id === myId) continue
        fireLocalGameEvent({ type: 'chat_message', map_id: mapId, ...msg })
      }
    })

    return () => {
      unsub_mapChatMessagesListener()
    }
  }, [mapId])

  const [players, setPlayers] = useState<DB['players']>({})
  const [playerPositions, setPlayerPositions] = useState<DB['player_positions']>({})

  useEffect(() => {
    log(stringify({ mapPlayerIds }))

    const unsub_playerListeners = keys(mapPlayerIds)
      .filter(id => id !== myId)
      .map(id =>
        db_playerListener(id, player =>
          setPlayers(
            produce(players => {
              if (player) players[id] = player
              else delete players[id]
            }),
          ),
        ),
      )

    const unsub_playerPositionListeners = keys(mapPlayerIds)
      .filter(id => id !== myId)
      .map(id =>
        db_playerPositionListener(id, position =>
          setPlayerPositions(
            produce(positions => {
              if (position) positions[id] = position
              else delete positions[id]
            }),
          ),
        ),
      )

    return () => {
      for (const unsub_playerListener of unsub_playerListeners) {
        unsub_playerListener()
      }
      for (const unsub_playerPositionListener of unsub_playerPositionListeners) {
        unsub_playerPositionListener()
      }
    }
  }, [mapPlayerIds])

  useEffect(() => {
    log(stringify({ players }))

    for (const id in players) {
      const player = players[id]!
      fireLocalGameEvent({ type: 'set_player', ...player })
    }
  }, [players])

  useEffect(() => {
    log(stringify({ playerPositions }))

    for (const id in playerPositions) {
      const position = playerPositions[id]!
      fireLocalGameEvent({ type: 'set_player_position', id, ...position })
    }
  }, [playerPositions])

  const fireGlobalGameEvent = async (event: GameEvent) => {
    fireLocalGameEvent(event)

    switch (event.type) {
      case 'set_player_position':
        db_setPlayerPosition(event.id, { x: event.x })
        break

      case 'chat_message':
        db_pushMapChatMessageWhileOnline(event.map_id, {
          msg: event.msg,
          player_id: event.player_id,
          timestamp: event.timestamp,
        })
        break
    }
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
        // fireLocalGameEvent({ type: 'player_input', uid: aiID, dir: random({ seed }) < 0.5 ? 'L' : 'R' })
      }
      timeoutID = setTimeout(ai, msRandom())

      return () => clearTimeout(timeoutID)
    },
    [mapId],
  )

  useEffect(() => {
    cpuIDs.forEach(startAI)
  }, [cpuIDs, startAI])

  const myPiece = pieces[myId]

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

  const myZIndex = zIndexes.findIndex(p => p.id === myId)
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
                type: 'chat_message',
                map_id: mapId,
                player_id: myId,
                msg,
                timestamp: `${Date.now()}`,
              })
              // fireGlobalGameEvent({
              //   type: 'player_chat',
              //   uid: myId,
              //   sprite: myPlayer.sprite_emoji,
              //   hueRotate: myPlayer.sprite_hue_rotate,
              //   name: myPlayer.name,
              //   msg,
              // })
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

  const onTouch = useCallback(
    (dir: 'L' | 'R') => async () => {
      if (!myPiece) return
      fireGlobalGameEvent({ type: 'set_player_position', id: myId, x: myPiece.x + (dir === 'L' ? -1 : 1) })
    },
    [myPiece?.x],
  )

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
