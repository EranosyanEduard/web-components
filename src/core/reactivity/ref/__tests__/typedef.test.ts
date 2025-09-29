import { describe, expect, expectTypeOf, it } from 'vitest'
import type { Ref, UnwrapRef } from '../typedef'

describe('тестовый набор типов `Ref`', () => {
  it(`должен "распаковать" значение реактивного значения`, () => {
    expect.hasAssertions()

    type Counter = Ref<number>

    expectTypeOf<UnwrapRef<Counter>>().toEqualTypeOf<number>()

    expect(true).toBe(true)
  })
})
