import { type ReactiveTypedef, reactive } from '../reactive'
import type * as Typedef from './typedef'

class Ref<T> {
  static isRef(value: unknown): value is Typedef.Ref<unknown> {
    return value instanceof Ref
  }

  private readonly reactiveValue: ReactiveTypedef.Reactive<Typedef.RefLike<T>>

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
