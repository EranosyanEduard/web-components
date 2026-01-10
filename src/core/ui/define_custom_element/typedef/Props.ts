import type { MarkRequired, StrictOmit } from 'ts-essentials'
import type { Getter, Predicate } from '../../../typedef'

export type PropConstructor<T> = (...args: any) => T
/**
 * Уточнить тип _props_-а веб-компонента (_type assertion_).
 * @since 1.0.0
 * @version 1.0.0
 */
export type PropType<T> = PropConstructor<T> | ReadonlyArray<PropConstructor<T>>
export interface AllPropOptions<T, Required extends boolean = boolean> {
  readonly default?: Getter<T>
  readonly reflector?: (value: T) => string
  readonly required?: Required
  readonly type: PropType<T>
  readonly validator?: Predicate<T>
}
export type DefaultPropOptions<T> = MarkRequired<
  AllPropOptions<T, false>,
  'default'
>
export type RequiredPropOptions<T> = MarkRequired<
  StrictOmit<AllPropOptions<T, true>, 'default'>,
  'required'
>
export type PropOptions<T> = RequiredPropOptions<T> | DefaultPropOptions<T>
/**
 * Конфигурация _props_-ов веб-компонента.
 * @since 1.0.0
 * @version 1.0.0
 */
export type PropsOptions<Props extends Record<string, unknown>> = {
  readonly [P in keyof Props]: PropOptions<Props[P]>
}
