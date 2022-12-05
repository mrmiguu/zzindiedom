import { Howl } from 'howler'
import { unpackDynamicImport } from './utils'

const soundImports = import.meta.glob<{ default: string }>('./sounds/**/*')

const sounds = {
  dash: unpackDynamicImport(soundImports['./sounds/main00.dsp.wav']!).then(src => new Howl({ src, volume: 0.025 })),
  jump: unpackDynamicImport(soundImports['./sounds/main22.dsp.wav']!).then(src => new Howl({ src, volume: 0.1 })),
  land: unpackDynamicImport(soundImports['./sounds/main23.dsp.wav']!).then(src => new Howl({ src, volume: 0.08 })),
  hit1: unpackDynamicImport(soundImports['./sounds/main2f.dsp.wav']!).then(src => new Howl({ src, volume: 0.1 })),
  hit2: unpackDynamicImport(soundImports['./sounds/main2e.dsp.wav']!).then(src => new Howl({ src, volume: 0.1 })),
  hit3: unpackDynamicImport(soundImports['./sounds/main2d.dsp.wav']!).then(src => new Howl({ src, volume: 0.1 })),
  hit4: unpackDynamicImport(soundImports['./sounds/main2c.dsp.wav']!).then(src => new Howl({ src, volume: 0.1 })),
  hit5: unpackDynamicImport(soundImports['./sounds/main2b.dsp.wav']!).then(src => new Howl({ src, volume: 0.1 })),
  death: unpackDynamicImport(soundImports['./sounds/main5aL.dsp.wav']!).then(src => new Howl({ src, volume: 0.2 })),
  button: unpackDynamicImport(soundImports['./sounds/maincd.dsp.wav']!).then(src => new Howl({ src, volume: 0.2 })),
  coin: unpackDynamicImport(soundImports['./sounds/main61.dsp.wav']!).then(src => new Howl({ src, volume: 0.2 })),
} as const

const hitSounds = ['hit1', 'hit2', 'hit3', 'hit4', 'hit5'] as const

export default sounds
export { hitSounds }
