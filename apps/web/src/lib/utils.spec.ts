import { ref } from 'vue'
import { describe, it, expect } from 'vitest'

import { valueUpdater } from './utils'

describe('valueUpdater', () => {
  it('replaces ref value when given a literal', () => {
    const state = ref(0)

    valueUpdater(5, state)

    expect(state.value).toBe(5)
  })

  it('derives next value from updater function', () => {
    const state = ref({ count: 1 })

    valueUpdater((prev) => ({ count: prev.count + 1 }), state)

    expect(state.value.count).toBe(2)
  })
})
