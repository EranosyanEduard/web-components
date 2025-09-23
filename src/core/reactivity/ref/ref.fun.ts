import Ref from './Ref.class'
import type * as Typedef from './typedef'

function ref<T>(value: T): Typedef.Ref<T> {
  // @ts-expect-error проигнорировать ошибку типизации:
  // подобная типизация возвращаемого значения позволяет
  // вывести тип реактивного значения в утилитах типов.
  return new Ref(value)
}

export default ref
