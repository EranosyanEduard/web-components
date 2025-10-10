import { describe, expect, it, vi } from 'vitest'
import { watchEffect } from '../../watch_effect'
import { reactive } from '../reactive.api'

describe('тестовый набор утилиты `reactive`', () => {
  it('должен создать реактивный массив', () => {
    expect.hasAssertions()

    const abc = reactive<string[]>([])
    const processAbc = vi.fn<(abc: string) => void>()
    watchEffect(() => processAbc(abc.join(',')))
    abc[0] = 'a'
    abc[1] = 'b'
    abc[2] = 'c'

    expect(abc.join(',')).toBe('a,b,c')
    expect(processAbc).toHaveBeenNthCalledWith(1, '')
    expect(processAbc).toHaveBeenNthCalledWith(2, 'a')
    expect(processAbc).toHaveBeenNthCalledWith(3, 'a,b')
    expect(processAbc).toHaveBeenNthCalledWith(4, 'a,b,c')
    expect(processAbc).toHaveBeenCalledTimes(4)
  })

  it('должен создать реактивный массив с методом "push"', () => {
    expect.hasAssertions()

    const abc = reactive<string[]>([])
    const processAbc = vi.fn<(abc: string) => void>()
    watchEffect(() => processAbc(abc.join(',')))
    abc.push('a')
    abc.push('b')
    abc.push('c')

    expect(abc.join(',')).toBe('a,b,c')
    expect(processAbc).toHaveBeenNthCalledWith(1, '')
    expect(processAbc).toHaveBeenNthCalledWith(2, 'a')
    expect(processAbc).toHaveBeenNthCalledWith(3, 'a,b')
    expect(processAbc).toHaveBeenNthCalledWith(4, 'a,b,c')
    expect(processAbc).toHaveBeenCalledTimes(4)
  })

  it('должен создать "глубоко" реактивный массив с реактивными элементами', () => {
    expect.hasAssertions()

    interface Counter {
      value: number
    }

    const counters = reactive<Counter[]>([
      { value: 0 },
      { value: 0 },
      { value: 0 }
    ])
    const processCounters = vi.fn<(counter: string) => void>()
    const joinCounters = (): string => {
      return counters.map(({ value }) => value).join(',')
    }
    watchEffect(() => processCounters(joinCounters()))
    counters[0].value++
    counters[1].value++
    counters[2].value++

    expect(joinCounters()).toBe('1,1,1')
    expect(processCounters).toHaveBeenNthCalledWith(1, '0,0,0')
    expect(processCounters).toHaveBeenNthCalledWith(2, '1,0,0')
    expect(processCounters).toHaveBeenNthCalledWith(3, '1,1,0')
    expect(processCounters).toHaveBeenNthCalledWith(4, '1,1,1')
    expect(processCounters).toHaveBeenCalledTimes(4)
  })
})
