import { describe, expect, it } from 'vitest'
import { mergeStoredData } from '@main/store'

describe('mergeStoredData', () => {
  it('keeps default object keys that are missing from loaded data', () => {
    const defaults = {
      width: 1024,
      height: 768,
      theme: 'light'
    }

    const loaded = {
      width: 1280
    }

    expect(mergeStoredData(defaults, loaded)).toEqual({
      width: 1280,
      height: 768,
      theme: 'light'
    })
  })

  it('merges nested plain objects recursively', () => {
    const defaults = {
      window: {
        width: 1024,
        height: 768,
        position: {
          x: 10,
          y: 20
        }
      },
      enabled: true
    }

    const loaded = {
      window: {
        height: 900,
        position: {
          y: 30
        }
      }
    }

    expect(mergeStoredData(defaults, loaded)).toEqual({
      window: {
        width: 1024,
        height: 900,
        position: {
          x: 10,
          y: 30
        }
      },
      enabled: true
    })
  })

  it('keeps the default value when a loaded object property is undefined', () => {
    const defaults = {
      width: 1024,
      height: 768
    }

    const loaded = {
      width: undefined,
      height: 900
    }

    expect(mergeStoredData(defaults, loaded)).toEqual({
      width: 1024,
      height: 900
    })
  })

  it('uses null from loaded object properties as an explicit value', () => {
    const defaults = {
      selectedId: 100,
      nested: {
        label: 'default',
        count: 1
      }
    }

    const loaded = {
      selectedId: null,
      nested: {
        label: null
      }
    }

    expect(mergeStoredData(defaults, loaded)).toEqual({
      selectedId: null,
      nested: {
        label: null,
        count: 1
      }
    })
  })

  it('replaces arrays instead of merging them', () => {
    const defaults = {
      recentFiles: ['a.json', 'b.json'],
      options: {
        values: [1, 2, 3]
      }
    }

    const loaded = {
      recentFiles: ['c.json'],
      options: {
        values: [4]
      }
    }

    expect(mergeStoredData(defaults, loaded)).toEqual({
      recentFiles: ['c.json'],
      options: {
        values: [4]
      }
    })
  })

  it('returns defaults when loaded data is null or undefined', () => {
    const defaults = {
      width: 1024
    }

    expect(mergeStoredData(defaults, null)).toEqual(defaults)
    expect(mergeStoredData(defaults, undefined)).toEqual(defaults)
  })
})
