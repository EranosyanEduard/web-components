import { describe, expect, it, vi } from 'vitest'
import { Effect } from '../../effect'
import Dependency from '../Dependency'

describe('тестовый набор класса `Dependency`', () => {
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
    const effect = new Effect(effect_)
    effect.use()
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.UNTRACKED_PROP)
    dependency.trigger(Key.UNTRACKED_PROP)
    dependency.trigger(Key.UNTRACKED_PROP)

    expect(effect_).toHaveBeenCalledTimes(4)
  })

  it(`должен связать эффект и зависимость однажды, при 1-ом использовании
    эффекта`, () => {
    expect.hasAssertions()

    const Key = Object.freeze({
      TRACKED_PROP: Symbol()
    } satisfies Record<string, symbol>)
    const dependency = new Dependency()
    const effect_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP)
    )
    const effect = new Effect(effect_)
    effect.use()
    effect.use()
    effect.use()
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.TRACKED_PROP)

    expect(effect_).toHaveBeenCalledTimes(6)
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
    const effectA = new Effect(effectA_)
    const effectB_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP_A)
    )
    const effectB = new Effect(effectB_)
    effectA.use()
    effectB.use()
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
    const effect = new Effect(effect_)
    effect.use()
    dependencyA.trigger(Key.TRACKED_PROP_A)
    dependencyA.trigger(Key.TRACKED_PROP_B)
    dependencyB.trigger(Key.TRACKED_PROP_A)
    dependencyB.trigger(Key.TRACKED_PROP_B)

    expect(effect_).toHaveBeenCalledTimes(5)
  })

  it(`не должен отслеживать изменения конкретного свойства зависимости,
    если отсутствует глобальный контекст эффекта, т.е. эффект не был
    использован`, () => {
    expect.hasAssertions()

    const Key = Object.freeze({
      TRACKED_PROP: Symbol()
    } satisfies Record<string, symbol>)
    const dependency = new Dependency()
    const effect_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP)
    )
    const effect = new Effect(effect_)
    // "шпион" позволяет устранить недостатки, указанные линтером.
    vi.spyOn(effect, 'use')
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.TRACKED_PROP)
    dependency.trigger(Key.TRACKED_PROP)

    expect(effect_).not.toHaveBeenCalled()
  })

  it('должен отслеживать изменения всех свойств', () => {
    expect.hasAssertions()

    const Key = Object.freeze({
      TRACKED_PROP_A: Symbol(),
      TRACKED_PROP_B: Symbol()
    } satisfies Record<string, symbol>)
    const dependency = new Dependency()
    const effectA_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP_A)
    )
    const effectA = new Effect(effectA_)
    const effectB_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP_B)
    )
    const effectB = new Effect(effectB_)
    const effectAll_ = vi.fn<VoidFunction>(() => dependency.trackAll())
    const effectAll = new Effect(effectAll_)
    effectA.use()
    effectB.use()
    effectAll.use()
    dependency.trigger(Key.TRACKED_PROP_A)
    dependency.trigger(Key.TRACKED_PROP_A)
    dependency.trigger(Key.TRACKED_PROP_B)
    dependency.trigger(Key.TRACKED_PROP_B)

    expect(effectA_).toHaveBeenCalledTimes(3)
    expect(effectB_).toHaveBeenCalledTimes(3)
    expect(effectAll_).toHaveBeenCalledTimes(5)
  })

  it('не должен прекращать отслеживание изменения свойств зависимости', () => {
    expect.hasAssertions()

    const Key = Object.freeze({
      TRACKED_PROP_A: Symbol(),
      TRACKED_PROP_B: Symbol()
    } satisfies Record<string, symbol>)
    const dependency = new Dependency()
    const effectA_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP_A)
    )
    const effectA = new Effect(effectA_)
    const effectB_ = vi.fn<VoidFunction>(() =>
      dependency.track(Key.TRACKED_PROP_B)
    )
    const effectB = new Effect(effectB_)
    const effectAll_ = vi.fn<VoidFunction>(() => dependency.trackAll())
    const effectAll = new Effect(effectAll_)
    const destroyA = effectA.use()
    const destroyB = effectB.use()
    effectAll.use()
    dependency.trigger(Key.TRACKED_PROP_A)
    dependency.trigger(Key.TRACKED_PROP_B)
    destroyA()
    destroyB()
    dependency.trigger(Key.TRACKED_PROP_A)
    dependency.trigger(Key.TRACKED_PROP_B)

    expect(effectA_).toHaveBeenCalledTimes(2)
    expect(effectB_).toHaveBeenCalledTimes(2)
    expect(effectAll_).toHaveBeenCalledTimes(5)
  })
})
