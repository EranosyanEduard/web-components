import isFunction from 'es-toolkit/compat/isFunction'
import noop from 'es-toolkit/compat/noop'
import type { Accessor } from '../../typedef'
import { type Ref, ref } from '../ref'
import { watchEffect } from '../watch_effect'
import type { ComputedRef } from './typedef'

class Computed<T> {
  static isComputed(value: unknown): value is ComputedRef<unknown> {
    return value instanceof Computed
  }

  private readonly accessor: Accessor<T>

  private readonly refValue: Ref<T>

  constructor(accessor: Accessor<T> | Accessor<T>['get']) {
    this.accessor = isFunction(accessor)
      ? { get: accessor, set: noop }
      : accessor
    // @ts-expect-error проигнорировать ошибку типизации:
    // значение undefined будет немедленно заменено в watchEffect
    // на значение корректного типа.
    this.refValue = ref(undefined)
    watchEffect(() => {
      this.refValue.value = this.accessor.get()
    })
  }

  get value(): T {
    return this.refValue.value
  }

  set value(newValue: T) {
    this.accessor.set(newValue)
  }
}

export default Computed
