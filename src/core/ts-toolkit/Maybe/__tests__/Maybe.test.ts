import { describe, expect, expectTypeOf, it } from 'vitest'
import type { Maybe } from '../Maybe'

describe('тестовый набор типа `Maybe`', () => {
  it('должен создать nullable-значение', () => {
    expect.hasAssertions()

    interface Context {
      readonly use: VoidFunction
    }

    expectTypeOf<Maybe<Context>>().toEqualTypeOf<Context | null>()

    expect(true).toBe(true)
  })
})
