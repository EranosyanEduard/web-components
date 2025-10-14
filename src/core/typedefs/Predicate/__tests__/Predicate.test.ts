import { describe, expect, expectTypeOf, it } from 'vitest'
import type { Predicate } from '../Predicate'

describe('тестовый набор типа `Predicate`', () => {
  it('должен создать функцию-предикат', () => {
    expect.hasAssertions()

    expectTypeOf<Predicate<string>>().toEqualTypeOf<
      (value: string) => boolean
    >()

    expect(true).toBe(true)
  })
})
