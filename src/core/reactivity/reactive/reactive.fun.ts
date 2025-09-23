import Reactive from './Reactive.class'
import type * as Typedef from './typedef'

function reactive<T extends object>(object: T): Typedef.Reactive<T> {
  return Reactive.new(object).value
}

export default reactive
