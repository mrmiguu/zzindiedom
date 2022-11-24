import produce from 'immer'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useAsync from 'react-use/lib/useAsync'
import { auth, signInAnonymously } from './firebase'
import sounds from './sounds'
import { setUTCSong } from './utcMusic'
import { error, log, random, stringify } from './utils'
import PieceBadge from './ZzPieceBadge'
import { PlayerSprite, playerSprites } from './ZzSprites'
import zzz_svg from './zzz.svg'

const shuffledPlayerSprites = produce<readonly PlayerSprite[]>(playerSprites, playerSpritesDraft => {
  playerSpritesDraft.sort(() => random() - 0.5)
})

type FormData = {
  userID: string
  playerName: string
  sprite: PlayerSprite
  hueShiftDeg: number
}

type StartScreenProps = {
  onSubmit: (data: FormData) => void
}

function StartScreen({ onSubmit }: StartScreenProps) {
  const [userID, setUserID] = useState<string | null>(null)
  const { register, handleSubmit, control } = useForm<FormData>()

  useAsync(async () => {
    const { user } = await signInAnonymously(auth)
    log(`You signed in (${user.uid})`)
    setUserID(user.uid)
  }, [])

  const generateRandomHueShiftDeg = () => 360 * random()
  const [hueShiftDeg, setHueShiftDeg] = useState(generateRandomHueShiftDeg())

  useEffect(() => {
    setUTCSong('STRAWBERRY_FLAVOR_LOVE')
  }, [])

  const gameLogo = (
    <div className="flex flex-col items-center text-black">
      <img className="w-20 h-20 -mb-3 animate-breathe" src={zzz_svg} />
      <div className="text-2xl font-bold">Zz Indie</div>
    </div>
  )

  const [animateDice, setAnimateDice] = useState(false)

  const characterChoice = (
    <Controller
      control={control}
      name="sprite"
      defaultValue={shuffledPlayerSprites[0]!}
      rules={{ required: true }}
      render={({ field: { onChange, value: sprite } }) => (
        <PieceBadge sprite={sprite} spriteHueShiftDeg={hueShiftDeg}>
          <div className="absolute flex items-end justify-end w-full h-full translate-x-3">
            <button
              className={`w-10 h-10 text-4xl rounded-full ${animateDice && 'animate-dice-bounce'}`}
              type="button"
              onMouseDown={() => setAnimateDice(true)}
              onAnimationStart={() => sounds.button.then(s => s.play())}
              onAnimationIteration={() => {
                setAnimateDice(false)

                setHueShiftDeg(generateRandomHueShiftDeg())

                const index = shuffledPlayerSprites.indexOf(sprite)
                onChange(shuffledPlayerSprites[(index + 1) % shuffledPlayerSprites.length]!)
              }}
            >
              <div className={`grayscale ${animateDice && 'animate-dice-spin'}`}>🎲</div>
            </button>
          </div>
        </PieceBadge>
      )}
    />
  )

  const nameField = (
    <input
      className="w-full px-2 py-1 text-white rounded bg-white/30"
      autoFocus
      autoComplete="off"
      placeholder="Player name here"
      {...register('playerName', { required: true })}
    />
  )

  const characterSelectForm = (
    <div className="relative w-64 h-48 rounded bg-black/30">
      <div className="absolute flex items-start justify-center w-full h-full p-4 pointer-events-none">
        <div className="pointer-events-auto">{characterChoice}</div>
      </div>
      <div className="absolute flex items-end justify-center w-full h-full p-4 pointer-events-none">
        <div className="pointer-events-auto">{nameField}</div>
      </div>
    </div>
  )

  const currentInfoNumberRef = useRef(0)
  const infoButton = (
    <button
      className="relative flex items-center justify-center w-10 h-10 px-4 py-2 border-2 border-white rounded-full hover:opacity-90 active:animate-ping"
      onMouseDown={e => sounds.button.then(s => s.play())}
      onClick={() => {
        const infoMessages = [
          'Zz Indie is a 1D online game. [press again for more info]',
          'Touch the Left and Right sides of the screen to move.',
          'Press 🎲 to roll a different random character.',
          'Type in a name for your player.',
          'Press 🔗 to invite other people to play!',
        ] as const

        toast(infoMessages[currentInfoNumberRef.current]!)
        currentInfoNumberRef.current = (currentInfoNumberRef.current + 1) % infoMessages.length
      }}
      type="button"
    >
      <div className="text-2xl leading-none text-black">i</div>
    </button>
  )

  const inviteButton = (
    <button
      className="px-4 py-2 text-black border-2 border-white rounded hover:opacity-90 active:animate-ping"
      onMouseDown={e => sounds.button.then(s => s.play())}
      onClick={async () => {
        // const myNetworkID = getMyNetworkID()
        // const networkIDFromURL = urlSearchParams()['network']

        // const networkID = networkIDFromURL ?? myNetworkID
        const url = new URL(`${location}`).toString()
        // url.searchParams.set('network', networkID)

        const shareData = { title: 'Zz Indie', text: `Play Zz Indie with me! ${url}` }

        try {
          await navigator.share(shareData)
          log(`Zz Indie shared successfully: ${stringify(shareData, null, 2)}`)
          return
        } catch (err) {
          log(`Zz Indie share failed: ${stringify(shareData, null, 2)}`)
          error(err)
        }

        try {
          await navigator.clipboard.writeText(url)
          log(`Zz Indie share URL copied successfully: "${url}"`)
          toast.success('Link copied!')
          return
        } catch (err) {
          log(`Zz Indie share URL copy failed: "${url}"`)
          error(err)
        }

        toast.error('Failed to share link. 😔')
      }}
      type="button"
    >
      <span className="grayscale brightness-[99] invert">🔗</span> Invite
    </button>
  )

  const startButton = (
    <button
      className={`px-4 py-2 bg-white rounded active:animate-ping ${
        userID ? 'animate-breathe hover:opacity-90' : 'contrast-50'
      }`}
      onMouseDown={e => sounds.button.then(s => s.play())}
      type="submit"
      disabled={!userID}
    >
      ▷ Start
    </button>
  )

  const ui = (
    <div className="absolute w-full h-full">
      <div className="absolute flex items-start justify-center w-full h-full p-4 pointer-events-none">{gameLogo}</div>
      <div className="absolute flex items-start justify-end w-full h-full p-4 pointer-events-none">
        <div className="pointer-events-auto">{infoButton}</div>
      </div>
      <div className="absolute flex items-center justify-center w-full h-full p-4 pointer-events-none">
        <div className="pointer-events-auto">{characterSelectForm}</div>
      </div>
      <div className="absolute flex items-end justify-center w-full h-full p-4 pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          {inviteButton}
          {startButton}
        </div>
      </div>
    </div>
  )

  const bgColor = <div className="absolute w-full h-full bg-gradient-to-b to-[#36D6ED] from-[#C8F6FF]" />

  const bgTexture = (
    <div
      className="absolute top-0 left-0 w-full h-full opacity-20 mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  )

  return (
    <form className="font-mono" onSubmit={handleSubmit(props => onSubmit({ ...props, hueShiftDeg, userID: userID! }))}>
      {bgColor}
      {bgTexture}
      {ui}
    </form>
  )
}

export default StartScreen
