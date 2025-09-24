import { type Reactive, reactive } from '../reactive'
import type { RefLike, Ref as TRef } from './typedef'

class Ref<T> {
  static isRef(value: unknown): value is TRef<unknown> {
    return value instanceof Ref
  }

  private readonly reactiveValue: Reactive<RefLike<T>>

  constructor(value: T) {
    this.reactiveValue = reactive({ value })
  }

  get value(): T {
    return this.reactiveValue.value
  }

  set value(newValue: T) {
    this.reactiveValue.value = newValue
  }
}

export default Ref
