import { Howl } from 'howler'
import { Voice } from './ZzTTS'

const voiceSampleImports = import.meta.glob<{ default: string }>('./voiceSamples/**/*')
const voiceSampleCache: Record<string, Howl> = {}

const fetchVoiceSample = async (voice: Voice) => {
  if (!(voice in voiceSampleCache)) {
    const { default: src } = await voiceSampleImports[`./voiceSamples/hey_${voice}.mp3`]!()
    voiceSampleCache[voice] = new Howl({ src, volume: 1.0 / 5 })
  }
  return voiceSampleCache[voice]!
}

export default fetchVoiceSample
