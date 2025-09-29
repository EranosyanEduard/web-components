import { describe, expect, it } from 'vitest'
import { isReactive, reactive } from '../reactive.api'

describe('тестовый набор утилиты `isReactive`', () => {
  it(`должен возвращать логическое значение, указывающее является ли значение
    реактивным объектом`, () => {
    expect.hasAssertions()

    expect(isReactive(reactive({ counter: 0 }))).toBe(true)
    expect(isReactive({ counter: 0 })).toBe(false)
  })
})
