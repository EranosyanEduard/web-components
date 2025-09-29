import { describe, expect, it } from 'vitest'
import { reactive } from '../../reactive'
import { isRef, ref } from '../ref.api'

describe('тестовый набор утилиты `isRef`', () => {
  it(`должен возвращать логическое значение, указывающее является ли значение
    реактивным значением`, () => {
    expect.hasAssertions()

    expect(isRef(ref(0))).toBe(true)
    expect(isRef(reactive({ value: 0 }))).toBe(false)
    expect(isRef({ value: 0 })).toBe(false)
  })
})
