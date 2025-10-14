import isArray from 'es-toolkit/compat/isArray'
import isFunction from 'es-toolkit/compat/isFunction'
import isObject from 'es-toolkit/compat/isObject'
import { Dependency } from '../dependency'
import type * as Typedefs from './typedefs'

const REACTIVE_REGISTRY = new WeakMap<object, Reactive<object>>()
/** Коллекция служебных ключей */
const MagicPropertyKey = Object.freeze({
  REACTIVE_SYMBOL: Symbol(),
  TRACK_ALL: Symbol()
} satisfies Record<string, symbol>)

/**
 * Реактивный объект.
 * @since 1.0.0
 * @version 1.0.0
 */
class Reactive<T extends object> {
  static isReactive(value: unknown): value is Typedefs.Reactive<object> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // невозможно гарантировать, что REACTIVE_SYMBOL является ключом value.
    return isObject(value) && value[MagicPropertyKey.REACTIVE_SYMBOL] === true
  }

  static new<T extends object>(
    object: T
  ): T extends Typedefs.Reactive<object> ? T : Typedefs.Reactive<T> {
    if (Reactive.isReactive(object)) {
      // @ts-expect-error проигнорировать ошибку типизации:
      // значение, возвращаемое методом будет соответствовать
      // типу Reactive<T>.
      return object
    }
    const reactiveValue = REACTIVE_REGISTRY.get(object) ?? new Reactive(object)
    // @ts-expect-error проигнорировать ошибку типизации:
    // см. комментарий выше.
    return reactiveValue.#value
  }

  static requestTrackAll(reactiveValue: Typedefs.Reactive<object>): void {
    // @ts-expect-error проигнорировать ошибку типизации:
    // реактивный объект имеет данное специальное свойство.
    reactiveValue[MagicPropertyKey.TRACK_ALL]
  }

  static #createReactiveArray<T extends unknown[]>(
    array: T
  ): Typedefs.Reactive<T> {
    const dependency = new Dependency()
    // @ts-expect-error проигнорировать ошибку типизации:
    // подобная типизация возвращаемого значения позволяет
    // использовать тип реактивного объекта в утилитах типов.
    return new Proxy(array, {
      get: (target, prop, receiver) => {
        if (prop === MagicPropertyKey.REACTIVE_SYMBOL) {
          return true
        }
        if (prop === MagicPropertyKey.TRACK_ALL) {
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
  ): Typedefs.Reactive<T> {
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
        if (prop === MagicPropertyKey.REACTIVE_SYMBOL) {
          return true
        }
        if (prop === MagicPropertyKey.TRACK_ALL) {
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

  readonly #value: Typedefs.Reactive<T>

  private constructor(object: T) {
    this.#value = isArray(object)
      ? Reactive.#createReactiveArray(object)
      : Reactive.#createReactiveObject(object)
    REACTIVE_REGISTRY.set(object, this)
  }
}

export default Reactive
