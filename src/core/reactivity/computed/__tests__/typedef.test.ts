import { describe, expect, expectTypeOf, it } from 'vitest'
import type {
  ComputedRef,
  UnwrapComputedRef,
  WritableComputedRef
} from '../typedef'

describe('тестовый набор типов `ComputedRef`', () => {
  it(`должен "распаковать" вычисляемое значение`, () => {
    expect.hasAssertions()

    type Counter = WritableComputedRef<number>
    type ReadonlyCounter = ComputedRef<number>

    expectTypeOf<UnwrapComputedRef<Counter>>().toEqualTypeOf<number>()
    expectTypeOf<UnwrapComputedRef<ReadonlyCounter>>().toEqualTypeOf<number>()

    expect(true).toBe(true)
  })
})
