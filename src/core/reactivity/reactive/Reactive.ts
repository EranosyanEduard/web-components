import isArray from 'es-toolkit/compat/isArray'
import isObject from 'es-toolkit/compat/isObject'
import noop from 'es-toolkit/compat/noop'
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
  static isReactive(value: unknown): value is Typedef.Reactive<object> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // невозможно гарантировать, что REACTIVE_SYMBOL является ключом value.
    return isObject(value) && value[MagicProps.REACTIVE_SYMBOL] === true
  }

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
    noop(reactiveValue[MagicProps.TRACK_ALL])
  }

  readonly value: Typedef.Reactive<T>

  private constructor(object: T) {
    this.value = this.#createReactiveObject(object)
    INSTANCES.set(object, this)
  }

  #createReactiveObject(object: T): Typedef.Reactive<T> {
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
        return isObject(value) && !isArray(value) ? Reactive.new(value) : value
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
}

export default Reactive
