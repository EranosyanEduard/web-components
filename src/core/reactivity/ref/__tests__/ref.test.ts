import { describe, expect, it, vi } from 'vitest'
import { isReactive } from '../../reactive'
import { watchEffect } from '../../watch_effect'
import { ref } from '../ref'

describe('тестовый набор утилиты `ref`', () => {
  it('должен создать реактивное значение', () => {
    expect.hasAssertions()

    const counter = ref(0)
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

    const counters = ref({ counterA: 0 })
    const processCounter = vi.fn<(counter: number) => void>()
    watchEffect(() => processCounter(counters.value.counterA))
    counters.value.counterA++
    counters.value.counterA++
    counters.value.counterA++

    expect(counters.value.counterA).toBe(3)
    expect(processCounter).toHaveBeenCalledTimes(4)
    expect(processCounter).toHaveBeenNthCalledWith(1, 0)
    expect(processCounter).toHaveBeenNthCalledWith(2, 1)
    expect(processCounter).toHaveBeenNthCalledWith(3, 2)
    expect(processCounter).toHaveBeenNthCalledWith(4, 3)
  })

  it(`не должен иметь эффекта, если реактивное значение,
    за которым установлено наблюдение, не изменилось`, () => {
    expect.hasAssertions()

    const counter = ref(0)
    const processCounter = vi.fn<(counter: number) => void>()
    watchEffect(() => processCounter(counter.value))
    counter.value = 0
    counter.value = 0
    counter.value = 0

    expect(counter.value).toBe(0)
    expect(processCounter).toHaveBeenCalledTimes(1)
    expect(processCounter).toHaveBeenNthCalledWith(1, 0)
  })

  it('не должен создать реактивное значение из реактивного значения', () => {
    expect.hasAssertions()

    const counterA = ref(0)

    expect(counterA).toBe(ref(counterA))
  })

  it('не должен воспринимать реактивное значение в качестве реактивного объекта', () => {
    expect.hasAssertions()
    expect(isReactive(ref(0))).toBe(false)
  })
})
