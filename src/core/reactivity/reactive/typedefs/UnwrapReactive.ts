import type { Reactive } from './Reactive'

/**
 * Распаковать реактивный объект.
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * const counter = reactive({ value: 0 })
 * type Counter = UnwrapReactive<typeof counter>
 * //   ^? { value: number }
 */
export type UnwrapReactive<T extends Reactive<object>> = T extends Reactive<
  infer U
>
  ? U
  : never
