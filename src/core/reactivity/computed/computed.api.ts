import Computed from './Computed'
import type { Accessor, ComputedRef, WritableComputedRef } from './typedef'

function computed<T>(value: Accessor<T>): WritableComputedRef<T>
function computed<T>(value: Accessor<T>['get']): ComputedRef<T>
function computed<T>(
  value: Accessor<T> | Accessor<T>['get']
): WritableComputedRef<T> | ComputedRef<T> {
  // @ts-expect-error проигнорировать ошибку типизации:
  // подобная типизация возвращаемого значения позволяет
  // вывести тип реактивного значения в утилитах типов.
  return new Computed(value)
}

function isComputedRef(value: unknown): value is ComputedRef<unknown> {
  return Computed.isComputed(value)
}

export { computed, isComputedRef }
