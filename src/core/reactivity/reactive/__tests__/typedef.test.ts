import { describe, expect, expectTypeOf, it } from 'vitest'
import type { Reactive, UnwrapReactive } from '../typedef'

describe('тестовый набор типов `Reactive`', () => {
  it(`должен "распаковать" значение реактивного объекта`, () => {
    expect.hasAssertions()

    type Counter = Reactive<{ value: number }>

    expectTypeOf<UnwrapReactive<Counter>>().toEqualTypeOf<{ value: number }>()

    expect(true).toBe(true)
  })
})
