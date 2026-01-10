import isFunction from 'es-toolkit/compat/isFunction'
import noop from 'es-toolkit/compat/noop'
import type { Accessor, AccessorGet } from '../../ts-toolkit'
import { type Ref, ref } from '../ref'
import { watchEffect } from '../watch_effect'
import type { ComputedRef, WritableComputedRef } from './typedefs'

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
  static new<T>(value: AccessorGet<T>): ComputedRef<T>
  static new<T>(
    value: Accessor<T> | AccessorGet<T>
  ): WritableComputedRef<T> | ComputedRef<T> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение, возвращаемое методом будет соответствовать
    // типам WritableComputedRef<T> | ComputedRef<T>.
    return new Computed(value)
  }

  readonly #accessor: Accessor<T>

  readonly #reactiveValue: Ref<T>

  private constructor(accessor: Accessor<T> | AccessorGet<T>) {
    this.#accessor = isFunction(accessor)
      ? { get: accessor, set: noop }
      : accessor
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение undefined будет немедленно заменено в watchEffect
    // на значение корректного типа.
    this.#reactiveValue = ref(undefined)
    watchEffect(() => {
      this.#reactiveValue.value = this.#accessor.get()
    })
  }

  get value(): T {
    return this.#reactiveValue.value
  }

  set value(newValue: T) {
    this.#accessor.set(newValue)
  }
}

export default Computed
