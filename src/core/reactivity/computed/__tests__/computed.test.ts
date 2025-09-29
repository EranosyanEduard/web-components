import { describe, expect, it, vi } from 'vitest'
import { isReactive } from '../../reactive'
import { isRef, ref } from '../../ref'
import { computed } from '../computed.api'

describe('тестовый набор утилиты `computed`', () => {
  it('должен создать вычисляемое значение, доступное только для чтения', () => {
    expect.hasAssertions()

    const counter = ref(0)
    const computeCounter = vi.fn<() => string>(
      () => `count is ${counter.value}`
    )
    const computedCounter = computed<string>(computeCounter)
    counter.value++
    counter.value++

    expect(computeCounter).toHaveBeenCalledTimes(3)
    expect(computeCounter).toHaveNthReturnedWith(1, 'count is 0')
    expect(computeCounter).toHaveNthReturnedWith(2, 'count is 1')
    expect(computeCounter).toHaveNthReturnedWith(3, 'count is 2')
    expect(computedCounter.value).toBe('count is 2')
  })

  it('должен создать вычисляемое значение, доступное для чтения и записи', () => {
    expect.hasAssertions()

    const counter = ref(0)
    const computeCounter = vi.fn<() => number>(() => counter.value)
    const computedCounter = computed<number>({
      get: computeCounter,
      set: (value) => {
        counter.value = value
      }
    })
    computedCounter.value++
    computedCounter.value++

    expect(computeCounter).toHaveBeenCalledTimes(3)
    expect(computeCounter).toHaveNthReturnedWith(1, 0)
    expect(computeCounter).toHaveNthReturnedWith(2, 1)
    expect(computeCounter).toHaveNthReturnedWith(3, 2)
    expect(computedCounter.value).toBe(2)
  })

  it(`не должен вычислять значение, если реактивное значение или объект,
    использующиеся в вычисляемом значении, не изменились`, () => {
    expect.hasAssertions()

    const counter = ref(0)
    const computeCounter = vi.fn<() => string>(
      () => `count is ${counter.value}`
    )
    const computedCounter = computed(computeCounter)
    counter.value = 0
    counter.value = 0
    counter.value = 0

    expect(computeCounter).toHaveBeenCalledTimes(1)
    expect(computeCounter).toHaveNthReturnedWith(1, 'count is 0')
    expect(computedCounter.value).toBe('count is 0')
  })

  it('не должен воспринимать вычисляемое значение в качестве реактивного объекта', () => {
    expect.hasAssertions()
    expect(isReactive(computed(() => 0))).toBe(false)
  })

  it('не должен воспринимать вычисляемое значение в качестве реактивного значения', () => {
    expect.hasAssertions()
    expect(isRef(computed(() => 0))).toBe(false)
  })
})
