import { polygonInradius } from './math'
import { values } from './utils'
import BoardPiece from './ZzBoardPiece'
import { GameState, PieceState } from './ZzTypes'

type TileCarouselProps = {
  tiles: number
  iCamera: number
  cameraAngle: number
  pieces: { [id: string]: PieceState }
  zIndexes: GameState['pieces'][keyof GameState['pieces']][]
}

function TileCarousel({ tiles, iCamera, cameraAngle, pieces, zIndexes }: TileCarouselProps) {
  const pxTile = 64
  const pxInradius = polygonInradius(tiles, pxTile)

  const tileColorClassForYellow = 'bg-[#F9DC4B] border-yellow-900'
  const tileColorClassForWhite = 'bg-white border-black'
  const tileColorClass = tileColorClassForWhite

  const tileEls = [...Array(tiles)].map((_, i) => {
    const tileTop = <div className={`absolute ${tileColorClass} w-full h-full border border-yellow-900 preserve-3d`} />
    const tileFront = (
      <div
        className={`absolute ${tileColorClass} w-full top-full border border-yellow-900 origin-top h-[24px] preserve-3d`}
        style={{ transform: `rotateX(-90deg)` }}
      />
    )
    const tileBack = (
      <div
        className={`absolute ${tileColorClass} w-full top-full border border-yellow-900 origin-top h-[24px] preserve-3d`}
        style={{ transform: `rotateX(-90deg) translateZ(-64px)` }}
      />
    )
    const tileLSide = (
      <div
        className={`absolute ${tileColorClass} w-full top-full border border-yellow-900 origin-top h-[24px] preserve-3d`}
        style={{ transform: `rotateX(-90deg) rotateY(90deg) translate3d(32px, 0, -32px)` }}
      />
    )
    const tileRSide = (
      <div
        className={`absolute ${tileColorClass} w-full top-full border border-yellow-900 origin-top h-[24px] preserve-3d`}
        style={{ transform: `rotateX(-90deg) rotateY(90deg) translate3d(32px, 0, 32px)` }}
      />
    )

    return (
      <div
        key={`${i}`}
        className="absolute w-[1px] h-[1px]"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotate(${(i * 360) / tiles}deg) translate(${0}px,${pxInradius}px)`,
        }}
      >
        <div
          className="relative -translate-x-1/2 left-1/2"
          style={{
            transformStyle: 'preserve-3d',
            width: `${pxTile}px`,
            height: `${pxTile}px`,
          }}
        >
          {tileTop}
          {tileLSide}
          {tileFront}
          {tileBack}
          {tileRSide}
        </div>
      </div>
    )
  })

  const pieceEls = values(pieces).map(piece => {
    const zIndex = zIndexes.findIndex(p => p.id === piece.id)
    const end = zIndexes.length - 1

    const perc = end > 0 ? zIndex / end : 0.5
    const offHalf = 0.5

    const narrowFactor = 1.1
    const z = perc / narrowFactor - offHalf / narrowFactor

    return (
      <div
        key={piece.id}
        className="absolute w-[1px] h-[1px] transition-transform duration-1000 ease-out-expo"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotate(${(-piece.x * 360) / tiles}deg) translate(${0}px,${pxInradius}px)`,
        }}
      >
        <div
          className="relative -translate-x-1/2 left-1/2"
          style={{
            transformStyle: 'preserve-3d',
            width: `${pxTile}px`,
            height: `${pxTile}px`,
          }}
        >
          <BoardPiece key={piece.id} {...piece} z={z} />
        </div>
      </div>
    )
  })

  return (
    <div
      className="absolute flex items-center justify-center w-full h-full transition-transform duration-1000"
      style={{
        transformStyle: 'preserve-3d',
        transform: `rotate3d(1,0,0,${cameraAngle}deg)`,
      }}
    >
      <div
        className="relative transition-transform duration-1000 ease-out-expo"
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate(${0}px,${-pxInradius}px) rotate(${(iCamera * 360) / tiles}deg)`,
        }}
      >
        {tileEls}
        {pieceEls}
      </div>
    </div>
  )
}

export default TileCarousel
