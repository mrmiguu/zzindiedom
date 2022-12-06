import { Howl } from 'howler'
import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { useVisibilityChange } from './hooks'
import { coordinatedUniversalMilliseconds, unpackDynamicImport } from './utils'

const musicImports = import.meta.glob<{ default: string }>('./music/**/*')

const music = {
  // APPLE_CINNAMON: unpackDynamicImport(musicImports['./music/APPLE CINNAMON.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // CUTE_AVALANCHE: unpackDynamicImport(musicImports['./music/CUTE AVALANCHE.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // GOLDEN_HOUR: unpackDynamicImport(musicImports['./music/GOLDEN HOUR.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // STRAWBERRY_FLAVOR_LOVE: unpackDynamicImport(musicImports['./music/STRAWBERRY FLAVOR LOVE.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // PENGUINS: unpackDynamicImport(musicImports['./music/PENGUINS.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // SUGAR_COOKIE_PIANO: unpackDynamicImport(musicImports['./music/SUGAR COOKIE (PIANO).mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // HOME: unpackDynamicImport(musicImports['./music/HOME.mp3']!).then(src => new Howl({ src, volume: 0.2, loop: true })),
  // MR_SUNNY_FACE: unpackDynamicImport(musicImports['./music/MR SUNNY FACE.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // PLAY_WITH_ME: unpackDynamicImport(musicImports['./music/PLAY WITH ME.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // SUGAR_COOKIE: unpackDynamicImport(musicImports['./music/SUGAR COOKIE.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // LEMON_CAKE: unpackDynamicImport(musicImports['./music/LEMON CAKE.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // YUMMY_FLAVOR: unpackDynamicImport(musicImports['./music/YUMMY FLAVOR.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  // O_Come_O_Come_Emmanuel: unpackDynamicImport(musicImports['./music/O_Come_O_Come_Emmanuel.mp3']!).then(
  //   src => new Howl({ src, volume: 0.2, loop: true }),
  // ),
  Silent_Night_Instrumental: unpackDynamicImport(musicImports['./music/Silent_Night_Instrumental.mp3']!).then(
    src => new Howl({ src, volume: 0.2, loop: true }),
  ),
} as const

const volumes: { -readonly [song in keyof typeof music]?: number } = {}

type SongName = keyof typeof music

let currentUTCSong: SongName | undefined
let playUTCSong: (track: SongName) => void

function useUTCMusic() {
  const fadeDuration = 1000

  const [_currentUTCSong, _playUTCSong] = useState<SongName>()
  currentUTCSong = _currentUTCSong
  playUTCSong = async track => {
    // await sleep(500)
    _playUTCSong(track)
  }

  const { value: howlCurrentTrack } = useAsync(async () => {
    if (!_currentUTCSong) return

    const howl = await music[_currentUTCSong]
    volumes[_currentUTCSong] = volumes[_currentUTCSong] ?? howl.volume()

    return howl
  }, [_currentUTCSong])

  const [musicUnlocked, setMusicUnlocked] = useState(false)
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
  const originalVolume = (_currentUTCSong && volumes[_currentUTCSong]) || 0

  const visibility = useVisibilityChange()

  const onLoad = () => {
    const duration = ~~((howlCurrentTrack?.duration() ?? 0) * 1000) / 1000 // keep accuracy only up to ms
    setMusicDuration(duration)
  }

  useEffect(() => {
    if (!howlCurrentTrack) return

    howlCurrentTrack.on('unlock', () => setMusicUnlocked(true))
    howlCurrentTrack.on('load', () => onLoad())
    howlCurrentTrack.on('pause', () => setMusicPaused(true))
    howlCurrentTrack.on('playerror', () => setMusicError(true))
    howlCurrentTrack.on('end', () => setMusicEnd(true))
    howlCurrentTrack.on('fade', () => setMusicFade(true))
    howlCurrentTrack.on('stop', () => setMusicStop(true))
    howlCurrentTrack.on('mute', () => setMusicMute(true))
    howlCurrentTrack.on('volume', () => setMusicVolume(true))
  }, [howlCurrentTrack])

  const fade = (track: Howl, volume: number, dir: 'in' | 'out') => {
    if (dir === 'in') {
      // track.fade(0, volume, fadeDuration)
      track.play()
    } else if (dir === 'out') {
      // track.fade(volume, 0, fadeDuration / 100)
      track.stop()
      // setTimeout(() => track.stop(), fadeDuration)
    }
  }

  useEffect(() => {
    if (!howlCurrentTrack) return
    if (!musicUnlocked) return
    if (!musicDuration) return

    const currentSeconds = coordinatedUniversalMilliseconds() / 1000
    setMusicSyncTimeData(currentSeconds)

    const startTime = currentSeconds % musicDuration
    setMusicStartTime(startTime)

    howlCurrentTrack.seek(startTime)
    fade(howlCurrentTrack, originalVolume, 'in')

    return () => {
      fade(howlCurrentTrack, originalVolume, 'out')
    }
  }, [howlCurrentTrack, musicUnlocked, musicDuration, restartMusic])

  // for when the phone screen turns off and the user turns it back on, opening the browser to restart the music
  useEffect(() => {
    if (!howlCurrentTrack) return
    if (!musicUnlocked) return
    if (!musicDuration) return
    if (visibility) setRestartMusic(coordinatedUniversalMilliseconds())
    else fade(howlCurrentTrack, originalVolume, 'out')
  }, [howlCurrentTrack, musicUnlocked, musicDuration, visibility])

  // log(
  //   stringify(
  //     {
  //       musicUnlocked,
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

export default music
export { useUTCMusic, playUTCSong, currentUTCSong }
