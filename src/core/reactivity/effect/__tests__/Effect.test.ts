import { describe, expect, it, type Mock, vi } from 'vitest'
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
    const ondestroyListeners: ReadonlyArray<Mock<(e: Effect) => void>> = [
      vi.fn<(e: Effect) => void>(),
      vi.fn<(e: Effect) => void>()
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
    const ondestroyListeners: ReadonlyArray<Mock<(e: Effect) => void>> = [
      vi.fn<(e: Effect) => void>(),
      vi.fn<(e: Effect) => void>()
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

    const spyEffect = vi.fn<(e: Effect) => void>()
    const effect = new Effect(() => spyEffect(Effect.getActive()))
    effect.use()

    expect(spyEffect.mock.lastCall?.[0]).toBeInstanceOf(Effect)
    expect(Effect.getActive()).toBeNull()
  })

  it(`должен сбросить глобальный контекст эффектов, даже если пользовательский
    эффект спровоцировал исключение`, () => {
    expect.hasAssertions()
    expect(() => {
      const effect = new Effect(() => {
        throw new Error('Ошибка в пользовательском эффекте')
      })
      effect.use()
    }).toThrow('Ошибка в пользовательском эффекте')
    expect(Effect.getActive()).toBeNull()
  })
})
