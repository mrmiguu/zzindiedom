const playerSprites = [
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐻‍❄️',
  '🐨',
  '🐯',
  '🦁',
  '🐮',
  '🐷',
  '🐸',
  '🐵',
  '🐣',
  '🐙',
  '🐲',
  '🌞',
  '🌝',
  '🌚',
  '🤠',
  '👶',
  '🥷',
  '🎅',
  '🤖',
  '😈',
  '👹',
  '👺',
  '🤡',
  '👻',
  '💀',
  '👽',
  '👾',
  '👁️',
  '👄',
  '👿',
  '🧟',
  '😎',
  '🤏',
  '👉',
  '👈',
  '🥊',
  '💩',
  '👌',
] as const

const scenerySprites = [
  '🌵',
  '🎄',
  '🌲',
  '🌳',
  '🌴',
  '🌱',
  '🌿',
  '🍀',
  '🪴',
  '🐚',
  '🪨',
  '🌾',
  '🌷',
  '🌹',
  '🥀',
  '🌻',
  '⛽️',
  '🚧',
  '🗿',
  '🗽',
  '🗼',
  '🏰',
  '🏯',
  '🎡',
  '🎢',
  '🎠',
  '⛲️',
  '⛱',
  '🗻',
  '🏠',
  '🏡',
  '🏚',
  '🏗',
  '🏭',
  '🏢',
  '🏬',
  '🏣',
  '🏤',
  '🏥',
  '🏦',
  '🏨',
  '🏪',
  '🏫',
  '🏩',
  '💒',
  '🏛',
  '⛪️',
] as const

const cityScenerySprites = [
  '⛽️',
  '🚧',
  '🗽',
  '🗼',
  '🎡',
  '🎢',
  '⛲️',
  '🏚',
  '🏗',
  '🏭',
  '🏢',
  '🏬',
  '🏣',
  '🏥',
  '🏦',
  '🏨',
  '🏪',
  '🏫',
  '🏩',
  '💒',
  '🏛',
  '⛪️',
] as const

type PlayerSprite = typeof playerSprites[number]

export type { PlayerSprite }
export { playerSprites, scenerySprites, cityScenerySprites }