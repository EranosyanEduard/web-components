import type { RefLike } from '../../ref'

declare const ComputedRefSymbol: unique symbol
export interface ComputedRef<T> extends Readonly<RefLike<T>> {
  readonly [ComputedRefSymbol]: true
}
export interface WritableComputedRef<T> extends RefLike<T> {
  readonly [ComputedRefSymbol]: true
}
/**
 * Распаковать вычисляемое значение.
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * <caption>вычисляемое свойство, доступное только для чтения</caption>
 * const counter = ref(0)
 * const computedCounter = computed<UnwrapRef<typeof counter>>(() => counter.value)
 * type ComputedCounter = UnwrapComputedRef<typeof computedCounter>
 * //   ^ number
 * @example
 * <caption>вычисляемое свойство, доступное для чтения и записи</caption>
 * const counter = ref(0)
 * const computedCounter = computed<UnwrapRef<typeof counter>>({
 *   get: () => {
 *     return counter.value
 *   },
 *   set: (value) => {
 *     counter.value = value
 *   }
 * })
 * type ComputedCounter = UnwrapComputedRef<typeof computedCounter>
 * //   ^ number
 */
export type UnwrapComputedRef<
  T extends ComputedRef<unknown> | WritableComputedRef<unknown>
> = T extends ComputedRef<infer U>
  ? U
  : T extends WritableComputedRef<infer U>
    ? U
    : never
