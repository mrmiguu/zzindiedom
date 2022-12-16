import { Howl } from 'howler'
import { error, log, stringify, values } from './utils'

const voiceLookup = {
  ['English US']: {
    ['Female']: 'en_us_001',
    ['Male 1']: 'en_us_006',
    ['Male 2']: 'en_us_007',
    ['Male 3']: 'en_us_009',
    ['Male 4']: 'en_us_010',
  },
  ['English UK']: {
    ['Male 1']: 'en_uk_001',
    ['Male 2']: 'en_uk_003',
  },
  ['English AU']: {
    ['Female']: 'en_au_001',
    ['Male']: 'en_au_002',
  },
  ['French']: {
    ['Male 1']: 'fr_001',
    ['Male 2']: 'fr_002',
  },
  ['German']: {
    ['Female']: 'de_001',
    ['Male']: 'de_002',
  },
  ['Spanish']: {
    ['Male']: 'es_002',
  },
  ['Spanish MX']: {
    ['Male']: 'es_mx_002',
  },
  ['Portuguese BR']: {
    // ['Female 1']: 'br_001',
    ['Female 2']: 'br_003',
    ['Female 3']: 'br_004',
    ['Male']: 'br_005',
  },
  ['Indonesian']: {
    ['Female']: 'id_001',
  },
  ['Japanese']: {
    ['Female 1']: 'jp_001',
    ['Female 2']: 'jp_003',
    ['Female 3']: 'jp_005',
    ['Male']: 'jp_006',
  },
  ['Korean']: {
    ['Male 1']: 'kr_002',
    ['Male 2']: 'kr_004',
    ['Female']: 'kr_003',
  },
  ['Characters']: {
    ['Ghostface (Scream)']: 'en_us_ghostface',
    ['Chewbacca (Star Wars)']: 'en_us_chewbacca',
    ['C3PO (Star Wars)']: 'en_us_c3po',
    ['Stitch (Lilo & Stitch)']: 'en_us_stitch',
    ['Stormtrooper (Star Wars)']: 'en_us_stormtrooper',
    ['Rocket (Guardians of the Galaxy)']: 'en_us_rocket',
  },
  // ['Singing']: {
  //   ['Alto']: 'en_female_f08_salut_damour',
  //   ['Tenor']: 'en_male_m03_lobby',
  //   ['Sunshine Soon']: 'en_male_m03_sunshine_soon',
  //   ['Warmy Breeze']: 'en_female_f08_warmy_breeze',
  //   ['Glorious']: 'en_female_ht_f08_glorious',
  //   ['It Goes Up']: 'en_male_sing_funny_it_goes_up',
  //   ['Chipmunk']: 'en_male_m2_xhxs_m03_silly',
  //   ['Dramatic']: 'en_female_ht_f08_wonderful_world',
  // },
} as const

type VoiceCategory = keyof typeof voiceLookup

type EnglishUSVoiceName = keyof typeof voiceLookup['English US']
type EnglishUKVoiceName = keyof typeof voiceLookup['English UK']
type EnglishAUVoiceName = keyof typeof voiceLookup['English AU']
type FrenchVoiceName = keyof typeof voiceLookup['French']
type GermanVoiceName = keyof typeof voiceLookup['German']
type SpanishVoiceName = keyof typeof voiceLookup['Spanish']
type SpanishMXVoiceName = keyof typeof voiceLookup['Spanish MX']
type PortugueseBRVoiceName = keyof typeof voiceLookup['Portuguese BR']
type IndonesianVoiceName = keyof typeof voiceLookup['Indonesian']
type JapaneseVoiceName = keyof typeof voiceLookup['Japanese']
type KoreanVoiceName = keyof typeof voiceLookup['Korean']
type CharactersVoiceName = keyof typeof voiceLookup['Characters']
type VoiceName =
  | EnglishUSVoiceName
  | EnglishUKVoiceName
  | EnglishAUVoiceName
  | FrenchVoiceName
  | GermanVoiceName
  | SpanishVoiceName
  | SpanishMXVoiceName
  | PortugueseBRVoiceName
  | IndonesianVoiceName
  | JapaneseVoiceName
  | KoreanVoiceName
  | CharactersVoiceName

type EnglishUSVoice = typeof voiceLookup['English US'][EnglishUSVoiceName]
type EnglishUKVoice = typeof voiceLookup['English UK'][EnglishUKVoiceName]
type EnglishAUVoice = typeof voiceLookup['English AU'][EnglishAUVoiceName]
type FrenchVoice = typeof voiceLookup['French'][FrenchVoiceName]
type GermanVoice = typeof voiceLookup['German'][GermanVoiceName]
type SpanishVoice = typeof voiceLookup['Spanish'][SpanishVoiceName]
type SpanishMXVoice = typeof voiceLookup['Spanish MX'][SpanishMXVoiceName]
type PortugueseBRVoice = typeof voiceLookup['Portuguese BR'][PortugueseBRVoiceName]
type IndonesianVoice = typeof voiceLookup['Indonesian'][IndonesianVoiceName]
type JapaneseVoice = typeof voiceLookup['Japanese'][JapaneseVoiceName]
type KoreanVoice = typeof voiceLookup['Korean'][KoreanVoiceName]
type CharactersVoice = typeof voiceLookup['Characters'][CharactersVoiceName]
// type SingingVoice = typeof voiceLookup['Singing'][keyof typeof voiceLookup['Singing']]
type Voice =
  | EnglishUSVoice
  | EnglishUKVoice
  | EnglishAUVoice
  | FrenchVoice
  | GermanVoice
  | SpanishVoice
  | SpanishMXVoice
  | PortugueseBRVoice
  | IndonesianVoice
  | JapaneseVoice
  | KoreanVoice
  | CharactersVoice
// | SingingVoice

const voices = values(voiceLookup).reduce<Voice[]>((acc, subVoices) => [...acc, ...values(subVoices)], [])

const reverseVoiceLookup = (voice: Voice): [VoiceCategory, VoiceName] => {
  for (const category in voiceLookup) {
    const voiceByName = voiceLookup[category as VoiceCategory]!
    for (const name in voiceByName) {
      // nested key type definitions are messy
      if ((voiceByName as any)[name] === voice) {
        return [category as VoiceCategory, name as VoiceName]
      }
    }
  }
  throw new Error('TypeScript bypassed')
}

const playAudio = (base64: string, volume = 1.0) =>
  new Promise(resolve => {
    const src = `data:audio/mpeg;base64,${base64}`
    const audio = new Howl({ src, volume })
    audio.on('load', resolve)
    audio.play()
  })

const textToSpeech = async (text: string, volume: number, voice: Voice) => {
  const ENDPOINT = 'https://tiktok-tts.weilnet.workers.dev'

  try {
    const resp = await fetch(`${ENDPOINT}/api/generation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: stringify({ text, voice }),
    })

    const json = await resp.json()

    if (json.data) await playAudio(json.data, volume)
    else throw new Error(json.error)
  } catch (e) {
    if (e instanceof Error) {
      error(e)
      log(`voice: "${voice}"`)
      log(`text: "${text}"`)
    }
  }
}

export type { VoiceCategory, Voice }
export { voiceLookup, voices, reverseVoiceLookup, textToSpeech }
