import Reactive from './Reactive.class'
import type * as Typedef from './typedef'

function isReactive(value: unknown): value is Typedef.Reactive<object> {
  return Reactive.isReactive(value)
}

export default isReactive
