import { useMemo } from 'react'
import { random } from './utils'
import { BeastState, EntityState, PieceState, PlayerState } from './ZzTypes'

type BoardPieceProps = (PieceState | EntityState | BeastState | PlayerState) & {
  z: number
}

function BoardPiece(props: BoardPieceProps) {
  const { id, z } = props

  const zDepth = props.static === 'background' ? -1 : props.static === 'foreground' ? 0 : -0.5 + z

  const animationDelay = useMemo(() => `${3 * random()}s`, [])

  const nameTag = 'name' in props && (
    <div className="px-2 text-xs text-center text-white rounded opacity-70 bg-black/50 whitespace-nowrap">
      {props.name}
    </div>
  )
  const cursor = ('name' in props || ('important' in props && props.important)) && (
    <div className={`leading-none text-xs ${props.important ? 'animate-bounce' : 'grayscale brightness-[99]'}`}>🔻</div>
  )
  const headTag = (nameTag || cursor) && (
    <div className="flex flex-col items-center">
      {nameTag}
      {cursor}
    </div>
  )

  const shadow = props.static !== 'background' && (
    <div
      className="flex justify-center w-16 transition-transform duration-1000 origin-bottom opacity-10 grayscale brightness-0 preserve-3d"
      style={{ transform: `translateZ(${1}px)` }}
    >
      <div className={`preserve-3d ${props.className}`} style={props.style}>
        {'sprite' in props && props.sprite}
      </div>
    </div>
  )

  return (
    <div className="absolute w-16 h-16 text-[4rem] leading-none preserve-3d">
      <div className="absolute w-16 h-16 overflow-hidden preserve-3d">
        <div
          className="absolute w-16 h-16 transition-transform preserve-3d"
          style={{ transform: `translateY(${zDepth * 64}px)` }}
        >
          {shadow}
        </div>
      </div>

      <div
        className="absolute w-16 h-16 transition-transform preserve-3d"
        style={{ transform: `translateY(${zDepth * 64}px) ${props.static ? 'translateZ(-2px)' : ''}` }}
      >
        <div
          className="absolute bottom-0 left-0 origin-bottom preserve-3d"
          style={{
            transform: `rotate3d(1,0,0,-90deg)`,
          }}
        >
          <div
            className={`flex justify-center w-16 origin-bottom preserve-3d ${!props.static && 'animate-breathe'}`}
            style={{
              animationDelay,
              filter: 'spriteHueShiftDeg' in props ? `hue-rotate(${props.spriteHueShiftDeg}deg)` : undefined,
            }}
          >
            <div className={`preserve-3d ${props.className}`} style={props.style}>
              {'sprite' in props && props.sprite}
            </div>
          </div>

          <div className="absolute top-0 -translate-x-1/2 -translate-y-full left-1/2">{headTag}</div>
        </div>
      </div>
    </div>
  )
}

export default BoardPiece
