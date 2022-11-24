import { useState } from 'react'

type LRScreenPaneProps = {
  opacity: number
  onClick: () => void
}

function LRScreenPane({ opacity, onClick }: LRScreenPaneProps) {
  return (
    <button
      className="w-1/2 h-full transition duration-150 ease-in-out bg-transparent focus:bg-transparent focus:outline-none focus:ring-0 active:bg-black"
      style={{ opacity }}
      onClick={onClick}
    />
  )
}

type LRScreenProps = {
  onL: () => void
  onR: () => void
}

function LRScreen({ onL, onR }: LRScreenProps) {
  const [opacity, setOpacity] = useState(0.1)

  return (
    <div className="absolute flex w-full h-full">
      <LRScreenPane
        opacity={opacity}
        onClick={() => {
          setOpacity(o => o * 0.7)
          onL()
        }}
      />
      <LRScreenPane
        opacity={opacity}
        onClick={() => {
          setOpacity(o => o * 0.7)
          onR()
        }}
      />
    </div>
  )
}

export default LRScreen
