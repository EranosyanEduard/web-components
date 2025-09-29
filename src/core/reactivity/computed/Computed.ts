import isFunction from 'es-toolkit/compat/isFunction'
import noop from 'es-toolkit/compat/noop'
import type { Accessor, Getter } from '../../typedef'
import { type Ref, ref } from '../ref'
import { watchEffect } from '../watch_effect'
import type { ComputedRef, WritableComputedRef } from './typedef'

/**
 * Вычисляемое значение.
 * @since 1.0.0
 * @version 1.0.0
 */
class Computed<T> {
  static isComputed(value: unknown): value is ComputedRef<unknown> {
    return value instanceof Computed
  }

  static new<T>(value: Accessor<T>): WritableComputedRef<T>
  static new<T>(value: Getter<T>): ComputedRef<T>
  static new<T>(
    value: Accessor<T> | Getter<T>
  ): WritableComputedRef<T> | ComputedRef<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение, возвращаемое методом будет соответствовать
    // типам WritableComputedRef<T> | ComputedRef<T>.
    return new Computed(value)
  }

  readonly #accessor: Accessor<T>

  readonly #refValue: Ref<T>

  private constructor(accessor: Accessor<T> | Getter<T>) {
    this.#accessor = isFunction(accessor)
      ? { get: accessor, set: noop }
      : accessor
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение undefined будет немедленно заменено в watchEffect
    // на значение корректного типа.
    this.#refValue = ref(undefined)
    watchEffect(() => {
      this.#refValue.value = this.#accessor.get()
    })
  }

  get value(): T {
    return this.#refValue.value
  }

  set value(newValue: T) {
    this.#accessor.set(newValue)
  }
}

export default Computed
