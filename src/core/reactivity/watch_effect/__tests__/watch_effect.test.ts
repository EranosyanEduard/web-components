import { describe, expect, it, vi } from 'vitest'
import { Dependency } from '../../dependency'
import watchEffect from '../watch_effect'

describe('тестовый набор утилиты `watchEffect`', () => {
  it('должен отслеживать изменения конкретного свойства зависимости', () => {
    expect.hasAssertions()

    const Key = Object.freeze({
      TRACKED_PROP: Symbol(),
      UNTRACKED_PROP: Symbol()
    } satisfies Record<string, symbol>)
    const dependency = new Dependency()
    const effect_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP)
    )
    watchEffect(effect_)
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.UNTRACKED_PROP)
    dependency.trigger(Key.UNTRACKED_PROP)
    dependency.trigger(Key.UNTRACKED_PROP)

    expect(effect_).toHaveBeenCalledTimes(4)
  })

  it('должен связать несколько эффектов и зависимость', () => {
    expect.hasAssertions()

    const Key = Object.freeze({
      TRACKED_PROP_A: Symbol()
    } satisfies Record<string, symbol>)
    const dependency = new Dependency()
    const effectA_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP_A)
    )
    const effectB_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP_A)
    )
    watchEffect(effectA_)
    watchEffect(effectB_)
    dependency.trigger(Key.TRACKED_PROP_A)
    dependency.trigger(Key.TRACKED_PROP_A)
    dependency.trigger(Key.TRACKED_PROP_A)

    expect(effectA_).toHaveBeenCalledTimes(4)
    expect(effectB_).toHaveBeenCalledTimes(4)
  })

  it('должен связать эффект и несколько зависимостей', () => {
    expect.hasAssertions()

    const Key = Object.freeze({
      TRACKED_PROP_A: Symbol(),
      TRACKED_PROP_B: Symbol()
    } satisfies Record<string, symbol>)
    const dependencyA = new Dependency()
    const dependencyB = new Dependency()
    const effect_ = vi.fn<VoidFunction>(() => {
      dependencyA.track(Key.TRACKED_PROP_A)
      dependencyA.track(Key.TRACKED_PROP_B)
      dependencyB.track(Key.TRACKED_PROP_A)
      dependencyB.track(Key.TRACKED_PROP_B)
    })
    watchEffect(effect_)
    dependencyA.trigger(Key.TRACKED_PROP_A)
    dependencyA.trigger(Key.TRACKED_PROP_B)
    dependencyB.trigger(Key.TRACKED_PROP_A)
    dependencyB.trigger(Key.TRACKED_PROP_B)

    expect(effect_).toHaveBeenCalledTimes(5)
  })

  it('должен прекращать отслеживание изменения свойств зависимости', () => {
    expect.hasAssertions()

    const Key = Object.freeze({
      TRACKED_PROP_A: Symbol()
    } satisfies Record<string, symbol>)
    const dependency = new Dependency()
    const effect_ = vi.fn<VoidFunction>(() => {
      dependency.track(Key.TRACKED_PROP_A)
    })
    const destroyEffect = watchEffect(effect_)
    dependency.trigger(Key.TRACKED_PROP_A)
    dependency.trigger(Key.TRACKED_PROP_A)
    destroyEffect()
    dependency.trigger(Key.TRACKED_PROP_A)
    dependency.trigger(Key.TRACKED_PROP_A)

    expect(effect_).toHaveBeenCalledTimes(3)
  })
})
