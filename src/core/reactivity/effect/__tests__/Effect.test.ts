import { describe, expect, it, type Mock, vi } from 'vitest'
import type { Maybe } from '../../../typedef'
import Effect from '../Effect'

describe('тестовый набор класса `Effect`', () => {
  it(`должен позволять использовать пользовательский эффект до момента его
    уничтожения`, () => {
    expect.hasAssertions()

    const effect_ = vi.fn<never>()
    const effect = new Effect(effect_)
    effect.use()
    effect.use()
    effect.use()()
    effect.use()
    effect.use()

    expect(effect_).toHaveBeenCalledTimes(3)
  })

  it('должен позволять подписываться на событие уничтожения эффекта', () => {
    expect.hasAssertions()

    const effect = new Effect(vi.fn<never>())
    const ondestroyListeners: ReadonlyArray<Mock<(effect: Effect) => void>> = [
      vi.fn<(effect: Effect) => void>(),
      vi.fn<(effect: Effect) => void>()
    ]
    ondestroyListeners.forEach((ondestroy) => {
      effect.ondestroy(ondestroy)
    })
    effect.use()()

    expect(ondestroyListeners[0]).toHaveBeenCalledTimes(1)
    expect(ondestroyListeners[1]).toHaveBeenCalledTimes(1)
    expect(ondestroyListeners[0]).toHaveBeenCalledWith(effect)
    expect(ondestroyListeners[1]).toHaveBeenCalledWith(effect)
  })

  it('должен уничтожать эффект с помощью функции очистки однажды', () => {
    expect.hasAssertions()

    const effect = new Effect(vi.fn<never>())
    const ondestroyListeners: ReadonlyArray<Mock<(effect: Effect) => void>> = [
      vi.fn<(effect: Effect) => void>(),
      vi.fn<(effect: Effect) => void>()
    ]
    const stopEffect = effect.use()
    ondestroyListeners.forEach((ondestroy) => {
      effect.ondestroy(ondestroy)
    })
    stopEffect()
    stopEffect()
    stopEffect()

    expect(ondestroyListeners[0]).toHaveBeenCalledTimes(1)
    expect(ondestroyListeners[1]).toHaveBeenCalledTimes(1)
    expect(ondestroyListeners[0]).toHaveBeenCalledWith(effect)
    expect(ondestroyListeners[1]).toHaveBeenCalledWith(effect)
  })

  it(`должен использовать пользовательский эффект в глобальном контексте
    эффектов`, () => {
    expect.hasAssertions()

    let effect_: Maybe<Effect> = null
    const effect = new Effect(() => {
      effect_ = Effect.current
    })
    effect.use()

    expect(effect_).toBeInstanceOf(Effect)
    expect(Effect.current).toBeNull()
  })

  it(`должен сбросить глобальный контекст эффектов, даже если пользовательский
    эффект спровоцировал исключение`, () => {
    expect.hasAssertions()

    const effect_ = vi.fn<() => never>().mockImplementationOnce(() => {
      throw new Error('Ошибка в пользовательском эффекте')
    })
    const effect = new Effect(effect_)

    expect(() => effect.use()).toThrow('Ошибка в пользовательском эффекте')
    expect(Effect.current).toBeNull()
  })
})
