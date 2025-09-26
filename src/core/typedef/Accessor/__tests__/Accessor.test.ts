import { describe, expect, expectTypeOf, it } from 'vitest'
import type { Accessor } from '../Accessor'

describe('тестовый набор типа `Accessor`', () => {
  it('должен создать свойство доступа для определённого типа', () => {
    expect.hasAssertions()

    interface Context {
      readonly use: VoidFunction
    }

    expectTypeOf<Accessor<Context | null>>().toEqualTypeOf<{
      readonly get: () => Context | null
      readonly set: (value: Context | null) => void
    }>()

    expect(true).toBe(true)
  })
})
