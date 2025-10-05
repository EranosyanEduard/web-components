import { describe, expect, expectTypeOf, it } from 'vitest'
import type { InjectionKey, UnwrapInjectionKey } from '../typedef'

describe('тестовый набор типов `Provide/Inject`', () => {
  it(`должен "распаковать" значение зависимости`, () => {
    expect.hasAssertions()

    type AppTheme = InjectionKey<{
      readonly dark: boolean
      readonly light: boolean
    }>

    expectTypeOf<UnwrapInjectionKey<AppTheme>>().toEqualTypeOf<{
      readonly dark: boolean
      readonly light: boolean
    }>()

    expect(true).toBe(true)
  })
})
