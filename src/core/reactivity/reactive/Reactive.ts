import isObject from 'es-toolkit/compat/isObject'
import noop from 'es-toolkit/compat/noop'
import { Dependency } from '../dependency'
import type { Reactive as TReactive } from './typedef'

class Reactive<T extends object> {
  static isReactive(value: unknown): value is TReactive<object> {
    return (
      // @ts-expect-error проигнорировать ошибку типизации:
      // невозможно гарантировать, что REACTIVE_SYMBOL является ключом value.
      isObject(value) && value[Reactive.#MagicProps.REACTIVE_SYMBOL] === true
    )
  }

  static new<T extends object>(object: T): Reactive<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение, возвращаемое методом будет соответствовать
    // типу Reactive<T>.
    return Reactive.#instances.get(object) ?? new Reactive(object)
  }

  static trackAll(reactiveValue: TReactive<object>): void {
    // @ts-expect-error проигнорировать ошибку типизации:
    // реактивный объект имеет данное специальное свойство.
    noop(reactiveValue[Reactive.#MagicProps.TRACK_ALL])
  }

  static readonly #instances = new WeakMap<object, Reactive<object>>()

  static readonly #MagicProps = Object.freeze({
    REACTIVE_SYMBOL: Symbol(),
    TRACK_ALL: Symbol()
  } satisfies Record<string, symbol>)

  readonly value: TReactive<T>

  readonly #dependency: Dependency<T>

  private constructor(object: T) {
    this.#dependency = new Dependency()
    this.value = this.#createReactiveValue(object)
    // @ts-expect-error проигнорировать ошибку типизации:
    // несоответствие значения this типу Reactive<object>
    // не влияет на работоспособность кода.
    Reactive.#instances.set(object, this)
  }

  #createReactiveValue(object: T): TReactive<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // подобная типизация возвращаемого значения позволяет
    // вывести тип реактивного объекта в утилитах типов.
    return new Proxy(object, {
      get: (target, prop, receiver) => {
        if (prop === Reactive.#MagicProps.REACTIVE_SYMBOL) {
          return true
        }
        if (prop === Reactive.#MagicProps.TRACK_ALL) {
          return this.#dependency.trackAll()
        }
        const value = Reflect.get(target, prop, receiver)
        // @ts-expect-error проигнорировать ошибку типизации:
        // невозможно гарантировать, что prop является ключом target.
        this.#dependency.track(prop)
        return isObject(value) ? Reactive.new(value) : value
      },
      set: (target, prop, value, receiver) => {
        // @ts-expect-error проигнорировать ошибку типизации:
        // невозможно гарантировать, что prop является ключом target.
        const oldValue = target[prop]
        const result = Reflect.set(target, prop, value, receiver)
        if (
          oldValue !== value &&
          !Number.isNaN(oldValue) &&
          !Number.isNaN(value)
        ) {
          // @ts-expect-error проигнорировать ошибку типизации:
          // невозможно гарантировать, что prop является ключом target.
          this.#dependency.trigger(prop)
        }
        return result
      }
    })
  }
}

export default Reactive
