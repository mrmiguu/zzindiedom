import { Howl } from 'howler'
import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { useVisibilityChange } from './hooks'
import { coordinatedUniversalMilliseconds, unpackDynamicImport } from './utils'

const musicImports = import.meta.glob<{ default: string }>('./music/**/*')

const music = {
  APPLE_CINNAMON: unpackDynamicImport(musicImports['./music/APPLE CINNAMON.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  CUTE_AVALANCHE: unpackDynamicImport(musicImports['./music/CUTE AVALANCHE.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  GOLDEN_HOUR: unpackDynamicImport(musicImports['./music/GOLDEN HOUR.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  STRAWBERRY_FLAVOR_LOVE: unpackDynamicImport(musicImports['./music/STRAWBERRY FLAVOR LOVE.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  PENGUINS: unpackDynamicImport(musicImports['./music/PENGUINS.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  SUGAR_COOKIE_PIANO: unpackDynamicImport(musicImports['./music/SUGAR COOKIE (PIANO).mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  HOME: unpackDynamicImport(musicImports['./music/HOME.mp3']!).then(src => new Howl({ src, volume: 0.2, loop: true })),
  MR_SUNNY_FACE: unpackDynamicImport(musicImports['./music/MR SUNNY FACE.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  PLAY_WITH_ME: unpackDynamicImport(musicImports['./music/PLAY WITH ME.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  SUGAR_COOKIE: unpackDynamicImport(musicImports['./music/SUGAR COOKIE.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  LEMON_CAKE: unpackDynamicImport(musicImports['./music/LEMON CAKE.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
  YUMMY_FLAVOR: unpackDynamicImport(musicImports['./music/YUMMY FLAVOR.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
} as const

type SongName = keyof typeof music

let currentUTCSong: SongName | undefined
let setUTCSong: (track: SongName) => void

function useUTCMusic() {
  const [_currentUTCSong, _setUTCSong] = useState<SongName>()
  currentUTCSong = _currentUTCSong
  setUTCSong = _setUTCSong

  const { value: howlCurrentTrack } = useAsync(
    async () => (_currentUTCSong ? music[_currentUTCSong] : undefined),
    [_currentUTCSong],
  )

  const [musicUnlocked, setMusicUnlocked] = useState(false)
  const [musicLoaded, setMusicLoaded] = useState(false)
  const [restartMusic, setRestartMusic] = useState(0)
  const [musicDuration, setMusicDuration] = useState(0)
  const [musicSyncTimeData, setMusicSyncTimeData] = useState(0)
  const [musicStartTime, setMusicStartTime] = useState(0)
  const [musicPaused, setMusicPaused] = useState(false)
  const [musicError, setMusicError] = useState(false)
  const [musicEnd, setMusicEnd] = useState(false)
  const [musicFade, setMusicFade] = useState(false)
  const [musicStop, setMusicStop] = useState(false)
  const [musicMute, setMusicMute] = useState(false)
  const [musicVolume, setMusicVolume] = useState(false)

  const visibility = useVisibilityChange()

  useEffect(() => {
    if (!howlCurrentTrack) return
    howlCurrentTrack.on('unlock', () => setMusicUnlocked(true))
    howlCurrentTrack.on('load', () => setMusicLoaded(true))
    howlCurrentTrack.on('pause', () => setMusicPaused(true))
    howlCurrentTrack.on('playerror', () => setMusicError(true))
    howlCurrentTrack.on('end', () => setMusicEnd(true))
    howlCurrentTrack.on('fade', () => setMusicFade(true))
    howlCurrentTrack.on('stop', () => setMusicStop(true))
    howlCurrentTrack.on('mute', () => setMusicMute(true))
    howlCurrentTrack.on('volume', () => setMusicVolume(true))
  }, [howlCurrentTrack])

  useEffect(() => {
    if (!howlCurrentTrack) return
    if (!musicUnlocked) return
    if (!musicLoaded) return

    const duration = ~~(howlCurrentTrack.duration() * 1000) / 1000 // keep accuracy only up to ms
    if (!duration) return
    setMusicDuration(duration)

    const currentSeconds = coordinatedUniversalMilliseconds() / 1000
    setMusicSyncTimeData(currentSeconds)

    const startTime = currentSeconds % duration
    setMusicStartTime(startTime)

    howlCurrentTrack.seek(startTime)
    howlCurrentTrack.play()

    return () => {
      howlCurrentTrack?.stop()
    }
  }, [howlCurrentTrack, musicUnlocked, musicLoaded, restartMusic])

  // for when the phone screen turns off and the user turns it back on, opening the browser to restart the music
  useEffect(() => {
    if (!howlCurrentTrack) return
    if (!musicUnlocked) return
    if (!musicLoaded) return
    if (visibility) setRestartMusic(coordinatedUniversalMilliseconds())
    else howlCurrentTrack.stop()
  }, [howlCurrentTrack, musicUnlocked, musicLoaded, visibility])

  // log(
  //   stringify(
  //     {
  //       musicUnlocked,
  //       musicLoaded,
  //       restartMusic,
  //       musicDuration,
  //       musicSyncTimeData,
  //       musicStartTime,
  //       musicPaused,
  //       musicError,
  //       musicEnd,
  //       musicFade,
  //       musicStop,
  //       musicMute,
  //       musicVolume,
  //     },
  //     null,
  //     2,
  //   ),
  // )
}

export { useUTCMusic, setUTCSong, currentUTCSong }