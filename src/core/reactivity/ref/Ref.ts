import { type Reactive, reactive } from '../reactive'
import type * as Typedef from './typedef'

/**
 * Реактивное значение.
 * @since 1.0.0
 * @version 1.0.0
 */
class Ref<T> {
  static isRef(value: unknown): value is Typedef.Ref<unknown> {
    return value instanceof Ref
  }

  static new<T>(value: T): T extends Typedef.Ref<unknown> ? T : Typedef.Ref<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение, возвращаемое методом будет соответствовать
    // типу Ref<T>.
    return Ref.isRef(value) ? value : new Ref(value)
  }

  readonly #reactiveValue: Reactive<Typedef.RefLike<T>>

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
