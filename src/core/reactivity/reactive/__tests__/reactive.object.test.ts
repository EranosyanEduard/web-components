import noop from 'es-toolkit/compat/noop'
import type { AnyFunction } from 'ts-essentials'
import { describe, expect, it, vi } from 'vitest'
import { watchEffect } from '../../watch_effect'
import { reactive } from '../reactive'

describe('тестовый набор утилиты `reactive`', () => {
  it('должен создать реактивный объект', () => {
    expect.hasAssertions()

    const counter = reactive({ value: 0 })
    const processCounter = vi.fn<(counter: number) => void>()
    watchEffect(() => processCounter(counter.value))
    counter.value++
    counter.value++
    counter.value++

    expect(counter.value).toBe(3)
    expect(processCounter).toHaveBeenCalledTimes(4)
    expect(processCounter).toHaveBeenNthCalledWith(1, 0)
    expect(processCounter).toHaveBeenNthCalledWith(2, 1)
    expect(processCounter).toHaveBeenNthCalledWith(3, 2)
    expect(processCounter).toHaveBeenNthCalledWith(4, 3)
  })

  it('должен создать "глубоко" реактивный объект', () => {
    expect.hasAssertions()

    const counters = reactive({
      counterA: { value: 0 }
    })
    const processCounter = vi.fn<(counter: number) => void>()
    watchEffect(() => processCounter(counters.counterA.value))
    counters.counterA.value++
    counters.counterA.value++
    counters.counterA.value++

    expect(counters.counterA.value).toBe(3)
    expect(processCounter).toHaveBeenCalledTimes(4)
    expect(processCounter).toHaveBeenNthCalledWith(1, 0)
    expect(processCounter).toHaveBeenNthCalledWith(2, 1)
    expect(processCounter).toHaveBeenNthCalledWith(3, 2)
    expect(processCounter).toHaveBeenNthCalledWith(4, 3)
  })

  it(`должен иметь эффект, если свойство реактивного объекта,
    за которым установлено наблюдение, было удалено`, () => {
    expect.hasAssertions()

    const counter = reactive<{ value?: number }>({ value: 0 })
    const processCounter = vi.fn<(counter?: number) => void>()
    watchEffect(() => processCounter(counter.value))
    delete counter.value
    counter.value = 0

    expect(counter.value).toBe(0)
    expect(processCounter).toHaveBeenCalledTimes(3)
    expect(processCounter).toHaveBeenNthCalledWith(1, 0)
    expect(processCounter).toHaveBeenNthCalledWith(2, undefined)
    expect(processCounter).toHaveBeenNthCalledWith(3, 0)
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

    const counter = reactive<{ value?: number }>({ value: 0 })
    const processCounter = vi.fn<(hasCounter: boolean) => void>()
    watchEffect(() => processCounter('value' in counter))
    delete counter.value
    counter.value = 0
    delete counter.value

    expect(processCounter).toHaveBeenCalledTimes(4)
    expect(processCounter).toHaveBeenNthCalledWith(1, true)
    expect(processCounter).toHaveBeenNthCalledWith(2, false)
    expect(processCounter).toHaveBeenNthCalledWith(3, true)
    expect(processCounter).toHaveBeenNthCalledWith(4, false)
  })

  it(`не должен иметь эффекта, если значение свойства реактивного объекта,
    за которым установлено наблюдение, не изменилось`, () => {
    expect.hasAssertions()

    const counter = reactive({ value: 0 })
    const processCounter = vi.fn<(value: number) => void>()
    watchEffect(() => processCounter(counter.value))
    counter.value = 0
    counter.value = 0
    counter.value = 0

    expect(processCounter).toHaveBeenCalledTimes(1)
    expect(processCounter).toHaveBeenCalledWith(0)
  })

  it(`не должен создать реактивный объект из объекта, для которого
    уже создан реактивный объект`, () => {
    expect.hasAssertions()

    const counter_ = { value: 0 }

    expect(reactive(counter_)).toBe(reactive(counter_))
  })

  it('не должен создать реактивный объект из реактивного объекта', () => {
    expect.hasAssertions()

    const counterA = reactive({ value: 0 })

    expect(counterA).toBe(reactive(counterA))
  })
})
