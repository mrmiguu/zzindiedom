import { polygonInradius } from './math'
import { values } from './utils'
import BoardPiece from './ZzBoardPiece'
import { GameState, PieceState } from './ZzTypes'

const mapSizes = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
  33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
  91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
  116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128,
] as const

type MapSize = typeof mapSizes[number]

type TileCarouselProps = {
  mapSize: MapSize
  iCamera: number
  cameraAngle: number
  pieces: { [id: string]: PieceState }
  zIndexes: GameState['pieces'][keyof GameState['pieces']][]
}

function TileCarousel({ mapSize, iCamera, cameraAngle, pieces, zIndexes }: TileCarouselProps) {
  const pxTile = 64
  const pxInradius = polygonInradius(mapSize, pxTile)

  const tileColorClassForYellow = 'bg-[#F9DC4B] border-yellow-900'
  const tileColorClassForWhite = 'bg-white border-black'
  const tileColorClass = tileColorClassForWhite

  const tileEls = [...Array(mapSize)].map((_, i) => {
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
          transform: `rotate(${(i * 360) / mapSize}deg) translate(${0}px,${pxInradius}px)`,
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
          transform: `rotate(${(-piece.x * 360) / mapSize}deg) translate(${0}px,${pxInradius}px)`,
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
          transform: `translate(${0}px,${-pxInradius}px) rotate(${(iCamera * 360) / mapSize}deg)`,
        }}
      >
        {tileEls}
        {pieceEls}
      </div>
    </div>
  )
}

export default TileCarousel
export type { MapSize }
export { mapSizes }
