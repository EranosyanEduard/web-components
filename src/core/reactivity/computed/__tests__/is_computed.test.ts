import { describe, expect, it } from 'vitest'
import { reactive } from '../../reactive'
import { ref } from '../../ref'
import { computed, isComputed } from '../computed.api'

describe('тестовый набор утилиты `computed`', () => {
  it(`должен возвращать логическое значение, указывающее является ли значение
    вычисляемым значением`, () => {
    expect.hasAssertions()

    expect(isComputed(computed(() => 0))).toBe(true)
    expect(isComputed(reactive({ value: 0 }))).toBe(false)
    expect(isComputed(ref(0))).toBe(false)
    expect(isComputed({ value: 0 })).toBe(false)
  })
})
