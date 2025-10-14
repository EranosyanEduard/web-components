import type { Ref } from './Ref'

/**
 * Распаковать реактивное значение.
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * const counter = ref(0)
 * type Counter = UnwrapRef<typeof counter>
 * //   ^? number
 */
export type UnwrapRef<T extends Ref<unknown>> = T extends Ref<infer U>
  ? U
  : never
