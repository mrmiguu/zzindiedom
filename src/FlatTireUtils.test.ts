import { expect, test } from 'vitest'
import { flattenKeyedData, sprinkleKeys, unarrayFlattenedDataKeys } from './FlatTireUtils'

test('sprinkling keys throughout object', () => {
  const actual = {
    players: {
      aaa111: {
        name: 'alex',
      },
      zzz999: {
        name: 'zach',
      },
    },
  }
  sprinkleKeys(actual)

  const expected = {
    players: {
      aaa111: {
        name: 'alex',
        keys: ['name'],
      },
      zzz999: {
        name: 'zach',
        keys: ['name'],
      },
      keys: ['aaa111', 'zzz999'],
    },
    keys: ['players'],
  }

  expect(actual).toEqual(expected)
})

test('flattening keyed data', () => {
  const obj = {
    players: {
      aaa111: {
        name: 'alex',
        keys: ['name'],
      },
      zzz999: {
        name: 'zach',
        keys: ['name'],
      },
      keys: ['aaa111', 'zzz999'],
    },
    keys: ['players'],
  }

  const actual = flattenKeyedData(obj)
  const expected = {
    players__aaa111__name: 'alex',
    players__aaa111__keys: ['name'],
    players__zzz999__name: 'zach',
    players__zzz999__keys: ['name'],
    players__keys: ['aaa111', 'zzz999'],
    keys: ['players'],
  }

  expect(actual).toEqual(expected)
})

test('unarray flattened data keys', () => {
  const obj = {
    players__aaa111__name: 'alex',
    players__aaa111__keys: ['name'],
    players__zzz999__name: 'zach',
    players__zzz999__keys: ['name'],
    players__keys: ['aaa111', 'zzz999'],
    keys: ['players'],
  }

  const actual = unarrayFlattenedDataKeys(obj)
  const expected = {
    players__aaa111__name: 'alex',
    players__aaa111__keys: { name: true },
    players__zzz999__name: 'zach',
    players__zzz999__keys: { name: true },
    players__keys: { aaa111: true, zzz999: true },
    keys: { players: true },
  }

  expect(actual).toEqual(expected)
})
