import noop from 'es-toolkit/compat/noop'
import type { AnyFunction } from 'ts-essentials'
import { describe, expect, it, vi } from 'vitest'
import { isReactive } from '../../reactive'
import { watchEffect } from '../../watch_effect'
import { ref } from '../ref.api'

describe('тестовый набор утилиты `ref`', () => {
  it('должен создать реактивное значение', () => {
    expect.hasAssertions()

    const counter = ref(0)
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

    const counters = ref({ counterA: 0 })
    const noopAs: AnyFunction = noop
    const effect_ = vi.fn<VoidFunction>(() => {
      noopAs(counters.value.counterA)
    })
    watchEffect(effect_)
    counters.value.counterA++
    counters.value.counterA++
    counters.value.counterA++

    expect(effect_).toHaveBeenCalledTimes(4)
  })

  it(`не должен иметь эффекта, если реактивное значение,
    за которым установлено наблюдение, не изменилось`, () => {
    expect.hasAssertions()

    const counter = ref(0)
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

  it('не должен создать реактивное значение из реактивного значения', () => {
    expect.hasAssertions()

    const counterA = ref(0)
    const counterB = ref(counterA)

    expect(counterA).toBe(counterB)
  })

  it('не должен воспринимать реактивное значение в качестве реактивного объекта', () => {
    expect.hasAssertions()
    expect(isReactive(ref(0))).toBe(false)
  })
})
