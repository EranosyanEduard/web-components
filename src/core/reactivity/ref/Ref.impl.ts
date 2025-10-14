import { type Reactive, reactive } from '../reactive'
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
    value: T
  ): T extends Typedefs.Ref<unknown> ? T : Typedefs.Ref<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение, возвращаемое методом будет соответствовать
    // типу Ref<T>.
    return Ref.isRef(value) ? value : new Ref(value)
  }

  readonly #reactiveValue: Reactive<Typedefs.RefLike<T>>

  private constructor(value: T) {
    this.#reactiveValue = reactive({ value })
  }

  get value(): T {
    return this.#reactiveValue.value
  }

  set value(newValue: T) {
    this.#reactiveValue.value = newValue
  }
}

export default Ref
