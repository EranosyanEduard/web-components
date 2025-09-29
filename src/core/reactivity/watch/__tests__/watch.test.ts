import { describe, expect, it, vi } from 'vitest'
import { computed, type UnwrapComputedRef } from '../../computed'
import { reactive, type UnwrapReactive } from '../../reactive'
import { ref, type UnwrapRef } from '../../ref'
import type { WatchHandler } from '../typedef'
import watch from '../watch'

describe('тестовый набор утилиты `watch`', () => {
  it(`должен наблюдать за реактивным объектом, реагируя на изменение любого
    его свойства`, () => {
    expect.hasAssertions()

    const counters = reactive({ a: 0, b: 0 })
    const watchHandler = vi.fn<WatchHandler<UnwrapReactive<typeof counters>>>()
    const stopWatch = watch(counters, watchHandler)
    counters.a++

    expect(watchHandler).toHaveBeenLastCalledWith(
      { a: 1, b: 0 },
      { a: 1, b: 0 }
    )

    counters.b++

    expect(watchHandler).toHaveBeenLastCalledWith(
      { a: 1, b: 1 },
      { a: 1, b: 1 }
    )
    expect(watchHandler).toHaveBeenCalledTimes(2)

    stopWatch()
    counters.a++
    counters.b++

    expect(watchHandler).toHaveBeenCalledTimes(2)
  })

  it('должен наблюдать за реактивным значением', () => {
    expect.hasAssertions()

    const counter = ref(0)
    const watchHandler = vi.fn<WatchHandler<UnwrapRef<typeof counter>>>()
    const stopWatch = watch(counter, watchHandler)
    counter.value++
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
    expect(watchHandler).toHaveBeenNthCalledWith(1, 1, 0)
    expect(watchHandler).toHaveBeenNthCalledWith(2, 2, 1)
    expect(watchHandler).toHaveBeenNthCalledWith(3, 3, 2)

    stopWatch()
    counter.value++
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
  })

  it('должен наблюдать за вычисляемым свойством, доступным только для чтения', () => {
    expect.hasAssertions()

    const counter = ref(0)
    const computedCounter = computed<number>(() => counter.value)
    const watchHandler =
      vi.fn<WatchHandler<UnwrapComputedRef<typeof computedCounter>>>()
    const stopWatch = watch(computedCounter, watchHandler)
    counter.value++
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
    expect(watchHandler).toHaveBeenNthCalledWith(1, 1, 0)
    expect(watchHandler).toHaveBeenNthCalledWith(2, 2, 1)
    expect(watchHandler).toHaveBeenNthCalledWith(3, 3, 2)

    stopWatch()
    counter.value++
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
  })

  it('должен наблюдать за вычисляемым свойством, доступным для чтения и записи', () => {
    expect.hasAssertions()

    const counter = ref(0)
    const computedCounter = computed<number>({
      get: () => counter.value,
      set: (value) => {
        counter.value = value
      }
    })
    const watchHandler =
      vi.fn<WatchHandler<UnwrapComputedRef<typeof computedCounter>>>()
    const stopWatch = watch(computedCounter, watchHandler)
    computedCounter.value++
    computedCounter.value++
    computedCounter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
    expect(watchHandler).toHaveBeenNthCalledWith(1, 1, 0)
    expect(watchHandler).toHaveBeenNthCalledWith(2, 2, 1)
    expect(watchHandler).toHaveBeenNthCalledWith(3, 3, 2)

    stopWatch()
    computedCounter.value++
    computedCounter.value++
    computedCounter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
  })

  it(`должен наблюдать за функциональным значением, в теле которого
    используется реактивный api`, () => {
    expect.hasAssertions()

    const counter = ref(0)
    const watchHandler = vi.fn<WatchHandler<UnwrapRef<typeof counter>>>()
    const stopWatch = watch(() => counter.value, watchHandler)
    counter.value++
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
    expect(watchHandler).toHaveBeenNthCalledWith(1, 1, 0)
    expect(watchHandler).toHaveBeenNthCalledWith(2, 2, 1)
    expect(watchHandler).toHaveBeenNthCalledWith(3, 3, 2)

    stopWatch()
    counter.value++
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
  })

  it(`должен "глубоко" сравнивать предыдущее и текущее значения при
    принятии решения о вызове наблюдателя, если его конфигурация содержит
    флаг "deep"`, () => {
    expect.hasAssertions()

    const counter = ref({ value: 0 })
    const watchHandler = vi.fn<WatchHandler<UnwrapRef<typeof counter>>>()
    watch(counter, watchHandler, { deep: true })
    counter.value = { value: 0 }
    counter.value = { value: 0 }
    counter.value = { value: 0 }
    counter.value = { value: 1 }

    expect(watchHandler).toHaveBeenCalledTimes(1)
    expect(watchHandler).toHaveBeenLastCalledWith({ value: 1 }, { value: 0 })
  })

  it(`должен немедленно вызвать наблюдатель, если его конфигурация содержит
    флаг "immediate"`, () => {
    expect.hasAssertions()

    const counter = ref(0)
    const watchHandler = vi.fn<WatchHandler<UnwrapRef<typeof counter>>>()
    watch(counter, watchHandler, { immediate: true })
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(3)
    expect(watchHandler).toHaveBeenNthCalledWith(1, 0, undefined)
    expect(watchHandler).toHaveBeenNthCalledWith(2, 1, 0)
    expect(watchHandler).toHaveBeenNthCalledWith(3, 2, 1)
  })

  it(`должен однажды вызвать наблюдатель, если его конфигурация содержит
    флаг "once"`, () => {
    expect.hasAssertions()

    const counter = ref(0)
    const watchHandler = vi.fn<WatchHandler<UnwrapRef<typeof counter>>>()
    watch(counter, watchHandler, { once: true })
    counter.value++
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(1)
    expect(watchHandler).toHaveBeenLastCalledWith(1, 0)
  })

  it(`должен немедленно и однажды вызвать наблюдатель, если его конфигурация
    содержит флаги "immediate" и "once"`, () => {
    expect.hasAssertions()

    const counter = ref(0)
    const watchHandler = vi.fn<WatchHandler<UnwrapRef<typeof counter>>>()
    watch(counter, watchHandler, {
      immediate: true,
      once: true
    })
    counter.value++
    counter.value++
    counter.value++

    expect(watchHandler).toHaveBeenCalledTimes(1)
    expect(watchHandler).toHaveBeenLastCalledWith(0, undefined)
  })
})
