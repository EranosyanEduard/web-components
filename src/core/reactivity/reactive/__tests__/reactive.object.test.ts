import noop from 'es-toolkit/compat/noop'
import type { AnyFunction } from 'ts-essentials'
import { describe, expect, it, vi } from 'vitest'
import { watchEffect } from '../../watch_effect'
import { reactive } from '../reactive.api'

describe('тестовый набор утилиты `reactive`', () => {
  it('должен создать реактивный объект', () => {
    expect.hasAssertions()

    const counter = reactive({ value: 0 })
    const noopAs: AnyFunction = noop
    const effect_ = vi.fn<VoidFunction>(() => {
      noopAs(counter.value)
    })
    watchEffect(effect_)
    counter.value++
    counter.value++
    counter.value++

    expect(effect_).toHaveBeenCalledTimes(4)
  })

  it('должен создать "глубоко" реактивный объект', () => {
    expect.hasAssertions()

    const counters = reactive({
      counterA: { value: 0 }
    })
    const noopAs: AnyFunction = noop
    const effect_ = vi.fn<VoidFunction>(() => {
      noopAs(counters.counterA.value)
    })
    watchEffect(effect_)
    counters.counterA.value++
    counters.counterA.value++
    counters.counterA.value++

    expect(effect_).toHaveBeenCalledTimes(4)
  })

  it(`должен иметь эффект, если свойство реактивного объекта,
    за которым установлено наблюдение, было удалено`, () => {
    expect.hasAssertions()

    const counter = reactive<{ value?: number }>({ value: 0 })
    const noopAs: AnyFunction = noop
    const effect_ = vi.fn<VoidFunction>(() => {
      noopAs(counter.value)
    })
    watchEffect(effect_)
    delete counter.value
    counter.value = 0

    expect(effect_).toHaveBeenCalledTimes(3)
  })

  it.fails(
    `должен иметь эффект, если в нём выполнена проверка наличия
    свойства реактивного объекта, за которым установлено наблюдение,
    с помощью метода "Object.hasOwn"`,
    () => {
      expect.hasAssertions()

      const counter = reactive({ value: 0 })
      const noopAs: AnyFunction = noop
      const effect_ = vi.fn<VoidFunction>(() => {
        noopAs(Object.hasOwn(counter, 'value'))
      })
      watchEffect(effect_)
      counter.value++
      counter.value++
      counter.value++

      expect(effect_).toHaveBeenCalledTimes(4)
    }
  )

  it(`должен иметь эффект, если в нём выполнена проверка наличия
    свойства реактивного объекта, за которым установлено наблюдение,
    с помощью оператора "in"`, () => {
    expect.hasAssertions()

    const counter = reactive({ value: 0 })
    const noopAs: AnyFunction = noop
    const effect_ = vi.fn<VoidFunction>(() => {
      noopAs('value' in counter)
    })
    watchEffect(effect_)
    counter.value++
    counter.value++
    counter.value++

    expect(effect_).toHaveBeenCalledTimes(4)
  })

  it(`не должен иметь эффекта, если значение свойства реактивного объекта,
    за которым установлено наблюдение, не изменилось`, () => {
    expect.hasAssertions()

    const counter = reactive({ value: 0 })
    const noopAs: AnyFunction = noop
    const effect_ = vi.fn<VoidFunction>(() => {
      noopAs(counter.value)
    })
    watchEffect(effect_)
    counter.value = 0
    counter.value = 0
    counter.value = 0

    expect(effect_).toHaveBeenCalledTimes(1)
  })

  it(`не должен создать реактивный объект из объекта, для которого
    уже создан реактивный объект`, () => {
    expect.hasAssertions()

    const counter_ = { value: 0 }
    const counterA = reactive(counter_)
    const counterB = reactive(counter_)

    expect(counterA).toBe(counterB)
  })

  it('не должен создать реактивный объект из реактивного объекта', () => {
    expect.hasAssertions()

    const counterA = reactive({ value: 0 })
    const counterB = reactive(counterA)

    expect(counterA).toBe(counterB)
  })
})
