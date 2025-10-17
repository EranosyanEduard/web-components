import type { Reactive, ReactiveConfig } from '../reactive'
import ReactiveImpl from '../reactive/Reactive.impl'
import type * as Typedefs from './typedefs'

/**
 * Реактивное значение.
 * @since 1.0.0
 * @version 1.0.0
 */
class Ref<T> {
  static isRef(value: unknown): value is Typedefs.Ref<unknown> {
    return value instanceof Ref
  }

  static new<T>(
    value: T,
    config?: Pick<ReactiveConfig, 'isShallow'>
  ): T extends Typedefs.Ref<unknown> ? T : Typedefs.Ref<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение, возвращаемое методом будет соответствовать
    // типу Ref<T>.
    return Ref.isRef(value) ? value : new Ref(value, config)
  }

  readonly #reactiveValue: Reactive<Typedefs.RefLike<T>>

  private constructor(value: T, config?: Pick<ReactiveConfig, 'isShallow'>) {
    this.#reactiveValue = ReactiveImpl.new({ value }, config)
  }

  get value(): T {
    return this.#reactiveValue.value
  }

  set value(newValue: T) {
    this.#reactiveValue.value = newValue
  }
}

export default Ref
