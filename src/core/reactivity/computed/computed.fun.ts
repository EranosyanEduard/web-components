import Computed from './Computed.class'
import type * as Typedef from './typedef'

function computed<T>(value: Typedef.Accessor<T>): Typedef.WritableComputedRef<T>
function computed<T>(value: Typedef.Accessor<T>['get']): Typedef.ComputedRef<T>
function computed<T>(
  value: Typedef.Accessor<T> | Typedef.Accessor<T>['get']
): Typedef.WritableComputedRef<T> | Typedef.ComputedRef<T> {
  // @ts-expect-error проигнорировать ошибку типизации:
  // подобная типизация возвращаемого значения позволяет
  // вывести тип реактивного значения в утилитах типов.
  return new Computed(value)
}

export default computed
