import isArray from 'es-toolkit/compat/isArray'
import isFunction from 'es-toolkit/compat/isFunction'
import isObject from 'es-toolkit/compat/isObject'
import { Dependency } from '../dependency'
import type * as Typedef from './typedef'

const INSTANCES = new WeakMap<object, Reactive<object>>()
const MagicProps = Object.freeze({
  REACTIVE_SYMBOL: Symbol(),
  TRACK_ALL: Symbol()
} satisfies Record<string, symbol>)

/**
 * Реактивный объект.
 * @since 1.0.0
 * @version 1.0.0
 */
class Reactive<T extends object> {
  /**
   * Предикат, проверяющий является ли полученный аргумент реактивным объектом.
   * @param value произвольное значение
   * @returns `true`, если `value` - реактивный объект, иначе - `false`
   * @since 1.0.0
   * @version 1.0.0
   * @example
   * isReactive(reactive({ counter: 0 })) // -> true
   * isReactive({ counter: 0 }) // -> false
   */
  static isReactive(value: unknown): value is Typedef.Reactive<object> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // невозможно гарантировать, что REACTIVE_SYMBOL является ключом value.
    return isObject(value) && value[MagicProps.REACTIVE_SYMBOL] === true
  }

  /**
   * Создать реактивный объект.
   * @param object произвольный объект
   * @returns реактивный объект
   * @since 1.0.0
   * @version 1.0.0
   * @example
   * <caption>Массив</caption>
   * const abc = reactive<string[]>([])
   * const stopEffect = watchEffect(() => {
   *   console.log(`abc includes ${abc.join(',')}`)
   * })
   * abc.push('a') // -> abc includes a
   * abc.push('b') // -> abc includes a,b
   * abc.push('c') // -> abc includes a,b,c
   * stopEffect()
   * abc.push('d')
   * abc.push('e')
   * abc.push('f')
   * @example
   * <caption>Объект</caption>
   * const counter = reactive({ value: 0 })
   * const stopEffect = watchEffect(() => {
   *   console.log(`count is ${counter.value}`)
   * })
   * counter.value++ // -> count is 1
   * counter.value++ // -> count is 2
   * counter.value++ // -> count is 3
   * stopEffect()
   * counter.value++
   * counter.value++
   * counter.value++
   */
  static new<T extends object>(
    object: T
  ): T extends Typedef.Reactive<object> ? T : Typedef.Reactive<T> {
    return Reactive.isReactive(object)
      ? // @ts-expect-error проигнорировать ошибку типизации:
        // значение, возвращаемое методом будет соответствовать
        // типу Reactive<T>.
        object
      : // @ts-expect-error см. коммент выше.
        (INSTANCES.get(object)?.value ?? new Reactive(object).value)
  }

  static trackAll(reactiveValue: Typedef.Reactive<object>): void {
    // @ts-expect-error проигнорировать ошибку типизации:
    // реактивный объект имеет данное специальное свойство.
    reactiveValue[MagicProps.TRACK_ALL]
  }

  static #createReactiveArray<T extends unknown[]>(
    array: T
  ): Typedef.Reactive<T> {
    const dependency = new Dependency()
    // @ts-expect-error проигнорировать ошибку типизации:
    // подобная типизация возвращаемого значения позволяет
    // использовать тип реактивного объекта в утилитах типов.
    return new Proxy(array, {
      get: (target, prop, receiver) => {
        if (prop === MagicProps.REACTIVE_SYMBOL) {
          return true
        }
        if (prop === MagicProps.TRACK_ALL) {
          return dependency.trackAll()
        }
        const value = Reflect.get(target, prop, receiver)
        if (Object.hasOwn(Array.prototype, prop) && isFunction(value)) {
          switch (value) {
            case Array.prototype.concat:
            case Array.prototype.every:
            case Array.prototype.filter:
            case Array.prototype.join:
            case Array.prototype.map:
            case Array.prototype.reduce:
            case Array.prototype.reduceRight:
            case Array.prototype.slice:
            case Array.prototype.some:
              return (...args: any) => {
                dependency.trackAll()
                return value.apply(
                  target.map((_, i) => receiver[i]),
                  args
                )
              }
            case Array.prototype.at: {
              const at: Array<unknown>['at'] = (index) => {
                const nonNegativeIndex =
                  index >= 0 ? index : target.length + index
                return receiver[nonNegativeIndex]
              }
              return at
            }
            case Array.prototype.pop: {
              const pop: Array<unknown>['pop'] = () => {
                const result = target.pop()
                dependency.trigger(target.length)
                return result
              }
              return pop
            }
            case Array.prototype.push: {
              const push: Array<unknown>['push'] = (...items) => {
                const length = target.length
                const result = target.push(...items)
                for (let i = length; i < target.length; i++) {
                  dependency.trigger(i)
                }
                return result
              }
              return push
            }
            case Array.prototype.reverse: {
              const reverse: Array<unknown>['reverse'] = () => {
                const oldTarget = target.slice()
                const result = target.reverse()
                oldTarget.forEach((it, i) => {
                  if (it !== target[i]) {
                    dependency.trigger(i)
                  }
                })
                return result
              }
              return reverse
            }
            case Array.prototype.sort: {
              const sort: Array<unknown>['sort'] = (compare) => {
                const oldTarget = target.slice()
                const result = target.sort(compare)
                oldTarget.forEach((it, i) => {
                  if (it !== target[i]) {
                    dependency.trigger(i)
                  }
                })
                return result
              }
              return sort
            }
            case Array.prototype.shift: {
              const shift: Array<unknown>['shift'] = () => {
                const result = target.shift()
                target.forEach((_, i) => {
                  dependency.trigger(i)
                })
                return result
              }
              return shift
            }
            case Array.prototype.unshift: {
              const unshift: Array<unknown>['unshift'] = (...items) => {
                const result = target.unshift(...items)
                target.forEach((_, i) => {
                  dependency.trigger(i)
                })
                return result
              }
              return unshift
            }
            // TODO: в работе.
            case Array.prototype.splice: {
              const splice: Array<unknown>['splice'] = (...args) => {
                const [start, deleteCount = target.length - start] = args
                const result = value.apply(target, args)
                for (let i = start; i <= deleteCount; i++) {
                  dependency.trigger(i)
                }
                return result
              }
              return splice
            }
          }
          return value.bind(target)
        }
        dependency.track(prop)
        return isObject(value) ? Reactive.new(value) : value
      },
      set: (target, prop, value, receiver) => {
        // @ts-expect-error проигнорировать ошибку типизации:
        // невозможно гарантировать, что prop является ключом target.
        const oldValue = target[prop]
        const isOk = Reflect.set(target, prop, value, receiver)
        if (
          oldValue !== value &&
          !Number.isNaN(oldValue) &&
          !Number.isNaN(value)
        ) {
          dependency.trigger(prop)
        }
        return isOk
      },
      has: (target, prop) => {
        dependency.track(prop)
        return Reflect.has(target, prop)
      },
      deleteProperty: (target, prop) => {
        const hasProp = Object.hasOwn(target, prop)
        const isOk = Reflect.deleteProperty(target, prop)
        if (hasProp && isOk) {
          dependency.trigger(prop)
        }
        return isOk
      }
    })
  }

  static #createReactiveObject<T extends object>(
    object: T
  ): Typedef.Reactive<T> {
    const dependency = new Dependency()
    // @ts-expect-error проигнорировать ошибку типизации:
    // подобная типизация возвращаемого значения позволяет
    // использовать тип реактивного объекта в утилитах типов.
    return new Proxy(object, {
      deleteProperty: (target, prop) => {
        const hasProp = Object.hasOwn(target, prop)
        const isOk = Reflect.deleteProperty(target, prop)
        if (hasProp && isOk) {
          dependency.trigger(prop)
        }
        return isOk
      },
      get: (target, prop, receiver) => {
        if (prop === MagicProps.REACTIVE_SYMBOL) {
          return true
        }
        if (prop === MagicProps.TRACK_ALL) {
          return dependency.trackAll()
        }
        const value = Reflect.get(target, prop, receiver)
        dependency.track(prop)
        return isObject(value) ? Reactive.new(value) : value
      },
      has: (target, prop) => {
        dependency.track(prop)
        return Reflect.has(target, prop)
      },
      set: (target, prop, value, receiver) => {
        // @ts-expect-error проигнорировать ошибку типизации:
        // невозможно гарантировать, что prop является ключом target.
        const oldValue = target[prop]
        const isOk = Reflect.set(target, prop, value, receiver)
        if (
          oldValue !== value &&
          !Number.isNaN(oldValue) &&
          !Number.isNaN(value)
        ) {
          dependency.trigger(prop)
        }
        return isOk
      }
    })
  }

  static #createReactiveValue<T extends object>(
    object: T
  ): Typedef.Reactive<T> | never {
    if (isArray(object)) {
      return Reactive.#createReactiveArray(object)
    }
    if (isObject(object)) {
      return Reactive.#createReactiveObject(object)
    }
    throw new Error(`Невозможно создать реактивный объект из ${object}`)
  }

  readonly value: Typedef.Reactive<T>

  private constructor(object: T) {
    this.value = Reactive.#createReactiveValue(object)
    INSTANCES.set(object, this)
  }
}

export default Reactive
