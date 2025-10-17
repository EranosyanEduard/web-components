import isArray from 'es-toolkit/compat/isArray'
import isFunction from 'es-toolkit/compat/isFunction'
import isObject from 'es-toolkit/compat/isObject'
import type { Dictionary } from 'ts-essentials'
import { Dependency } from '../dependency'
import type * as Typedefs from './typedefs'

const REACTIVE_REGISTRY = new WeakMap<object, Reactive<object>>()
/** Коллекция служебных ключей */
const MagicPropertyKey = Object.freeze({
  REACTIVE_SYMBOL: Symbol(),
  TRACK_ALL_PROPERTY_KEYS: Symbol()
} satisfies Dictionary<symbol>)

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
    object: T,
    config?: Partial<Typedefs.ReactiveConfig>
  ): T extends Typedefs.Reactive<object> ? T : Typedefs.Reactive<T> {
    if (Reactive.isReactive(object)) {
      // @ts-expect-error проигнорировать ошибку типизации:
      // значение, возвращаемое методом будет соответствовать
      // типу Reactive<T>.
      return object
    }
    const reactiveValue =
      REACTIVE_REGISTRY.get(object) ?? new Reactive(object, config)
    // @ts-expect-error проигнорировать ошибку типизации:
    // см. комментарий выше.
    return reactiveValue.#value
  }

  static requestTrackAllPropertyKeys(
    reactiveObject: Typedefs.Reactive<object>
  ): void {
    // @ts-expect-error проигнорировать ошибку типизации:
    // потребовать наблюдения за всеми свойствами реактивного объекта.
    reactiveObject[MagicPropertyKey.TRACK_ALL_PROPERTY_KEYS]
  }

  readonly #config: Typedefs.ReactiveConfig

  readonly #dependency: Dependency

  readonly #value: Typedefs.Reactive<T>

  private constructor(object: T, config?: Partial<Typedefs.ReactiveConfig>) {
    const { externalDependencies = [], isShallow = false } = config ?? {}
    this.#config = {
      externalDependencies,
      isShallow
    }
    this.#dependency = new Dependency()
    this.#value = isArray(object)
      ? this.#createReactiveArray(object)
      : this.#createReactiveObject(object)
    REACTIVE_REGISTRY.set(object, this)
  }

  #createReactiveArray<T extends unknown[]>(array: T): Typedefs.Reactive<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // подобная типизация возвращаемого значения позволяет
    // использовать тип реактивного объекта в утилитах типов.
    return new Proxy(array, {
      get: (target, prop, receiver) => {
        if (prop === MagicPropertyKey.REACTIVE_SYMBOL) {
          return true
        }
        if (prop === MagicPropertyKey.TRACK_ALL) {
          return this.#dependency.trackAll()
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
                this.#dependency.trackAll()
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
                this.#dependency.trigger(target.length)
                return result
              }
              return pop
            }
            case Array.prototype.push: {
              const push: Array<unknown>['push'] = (...items) => {
                const length = target.length
                const result = target.push(...items)
                for (let i = length; i < target.length; i++) {
                  this.#dependency.trigger(i)
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
                    this.#dependency.trigger(i)
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
                    this.#dependency.trigger(i)
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
                  this.#dependency.trigger(i)
                })
                return result
              }
              return shift
            }
            case Array.prototype.unshift: {
              const unshift: Array<unknown>['unshift'] = (...items) => {
                const result = target.unshift(...items)
                target.forEach((_, i) => {
                  this.#dependency.trigger(i)
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
                  this.#dependency.trigger(i)
                }
                return result
              }
              return splice
            }
          }
          return value.bind(target)
        }
        this.#dependency.track(prop)
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
          this.#dependency.trigger(prop)
        }
        return isOk
      },
      has: (target, prop) => {
        this.#dependency.track(prop)
        return Reflect.has(target, prop)
      },
      deleteProperty: (target, prop) => {
        const hasProp = Object.hasOwn(target, prop)
        const isOk = Reflect.deleteProperty(target, prop)
        if (hasProp && isOk) {
          this.#dependency.trigger(prop)
        }
        return isOk
      }
    })
  }

  #createReactiveObject<T extends object>(object: T): Typedefs.Reactive<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // подобная типизация возвращаемого значения позволяет
    // использовать тип реактивного объекта в утилитах типов.
    return new Proxy(object, {
      deleteProperty: (target, prop) => {
        const hasProp = Object.hasOwn(target, prop)
        const isOk = Reflect.deleteProperty(target, prop)
        if (hasProp && isOk) {
          this.#dependency.trigger(prop)
        }
        return isOk
      },
      get: (target, prop, receiver) => {
        if (prop === MagicPropertyKey.REACTIVE_SYMBOL) {
          return true
        }
        if (prop === MagicPropertyKey.TRACK_ALL_PROPERTY_KEYS) {
          return this.#dependency.trackAll()
        }
        const value = Reflect.get(target, prop, receiver)
        this.#dependency.track(prop)
        return isObject(value) && !this.#config.isShallow
          ? Reactive.new(value, {
              externalDependencies: [
                ...this.#config.externalDependencies,
                this.#dependency
              ]
            })
          : value
      },
      has: (target, prop) => {
        this.#dependency.track(prop)
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
          this.#dependency.trigger(prop)
          for (const d of this.#config.externalDependencies) {
            d.triggerAll()
          }
        }
        return isOk
      }
    })
  }
}

export default Reactive
