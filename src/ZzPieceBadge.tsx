import { PropsWithChildren } from 'react'
import { BeastState, EntityState, PlayerState } from './ZzTypes'

type OnlySprite = Pick<EntityState, 'sprite' | 'spriteHueShiftDeg'>

type PieceBadgeProps = PropsWithChildren<
  (OnlySprite | EntityState | BeastState | PlayerState) & {
    size?: 12 | 16 | 20 | 24
    onClick?: () => void
  }
>

function PieceBadge({ sprite, spriteHueShiftDeg, size, onClick, children }: PieceBadgeProps) {
  const sizeCls = size === 12 ? 'w-12 h-12' : size === 16 ? 'w-16 h-16' : size === 20 ? 'w-20 h-20' : 'w-24 h-24'

  return (
    <div className={`relative ${sizeCls} ${onClick && 'pointer-events-auto cursor-pointer'}`} onClick={onClick}>
      <div className="absolute bottom-0 w-full h-full overflow-hidden border border-white rounded-full w- bg-black/30" />

      <div className="absolute flex items-end justify-center w-full h-[999%] bottom-0 overflow-hidden border-b-2 border-white rounded-full">
        <div
          className={`${
            size === 12 ? 'text-[48px]' : size === 16 ? 'text-[64px]' : size === 20 ? 'text-[80px]' : 'text-[96px]'
          } leading-none`}
          style={{ filter: `hue-rotate(${spriteHueShiftDeg}deg)` }}
        >
          {sprite}
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full">{children}</div>
    </div>
  )
}

export default PieceBadge
