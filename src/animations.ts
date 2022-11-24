import { unpackDynamicImport } from './utils'

const animationImports = import.meta.glob<{ default: string }>('./animations/**/*')

const animations = {
  knockoutFlare: unpackDynamicImport(animationImports['./animations/knockout-flare.gif']!),
} as const

export { animations }
