import { Howl } from 'howler'
import { error, log, stringify, values } from './utils'

const voices = {
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
    ['Female 1']: 'br_001',
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
  ['Singing']: {
    ['Alto']: 'en_female_f08_salut_damour',
    ['Tenor']: 'en_male_m03_lobby',
    ['Sunshine Soon']: 'en_male_m03_sunshine_soon',
    ['Warmy Breeze']: 'en_female_f08_warmy_breeze',
    ['Glorious']: 'en_female_ht_f08_glorious',
    ['It Goes Up']: 'en_male_sing_funny_it_goes_up',
    ['Chipmunk']: 'en_male_m2_xhxs_m03_silly',
    ['Dramatic']: 'en_female_ht_f08_wonderful_world',
  },
} as const

type VoiceCategory = keyof typeof voices
type EnglishUSVoice = typeof voices['English US'][keyof typeof voices['English US']]
type EnglishUKVoice = typeof voices['English UK'][keyof typeof voices['English UK']]
type EnglishAUVoice = typeof voices['English AU'][keyof typeof voices['English AU']]
type FrenchVoice = typeof voices['French'][keyof typeof voices['French']]
type GermanVoice = typeof voices['German'][keyof typeof voices['German']]
type SpanishVoice = typeof voices['Spanish'][keyof typeof voices['Spanish']]
type SpanishMXVoice = typeof voices['Spanish MX'][keyof typeof voices['Spanish MX']]
type PortugueseBRVoice = typeof voices['Portuguese BR'][keyof typeof voices['Portuguese BR']]
type IndonesianVoice = typeof voices['Indonesian'][keyof typeof voices['Indonesian']]
type JapaneseVoice = typeof voices['Japanese'][keyof typeof voices['Japanese']]
type KoreanVoice = typeof voices['Korean'][keyof typeof voices['Korean']]
type CharactersVoice = typeof voices['Characters'][keyof typeof voices['Characters']]
type SingingVoice = typeof voices['Singing'][keyof typeof voices['Singing']]
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
  | SingingVoice

const voiceList = values(voices).reduce<Voice[]>((acc, subVoices) => [...acc, ...values(subVoices)], [])

const playAudio = (base64: string, volume = 1.0) =>
  new Promise(resolve => {
    const src = `data:audio/mpeg;base64,${base64}`
    const audio = new Howl({ src, volume })
    audio.on('load', resolve)
    audio.play()
  })

const textToSpeech = async (text: string, volume: number) => {
  const ENDPOINT = 'https://tiktok-tts.weilnet.workers.dev'
  const voice = voices['English US']['Female']

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
export { voices, voiceList, textToSpeech }
