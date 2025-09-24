import Reactive from './Reactive'
import type { Reactive as TReactive } from './typedef'

function isReactive(value: unknown): value is TReactive<object> {
  return Reactive.isReactive(value)
}

function reactive<T extends object>(object: T): TReactive<T> {
  return Reactive.new(object).value
}

function reactiveTrackAll(reactiveValue: TReactive<object>): void {
  Reactive.trackAll(reactiveValue)
}

export { isReactive, reactive, reactiveTrackAll }
