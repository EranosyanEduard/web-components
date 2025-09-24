import Ref from './Ref'
import type { Ref as TRef } from './typedef'

function isRef(value: unknown): value is TRef<unknown> {
  return Ref.isRef(value)
}

function ref<T>(value: T): TRef<T> {
  // @ts-expect-error проигнорировать ошибку типизации:
  // подобная типизация возвращаемого значения позволяет
  // вывести тип реактивного значения в утилитах типов.
  return new Ref(value)
}

export { isRef, ref }
