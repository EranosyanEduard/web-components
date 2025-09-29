import type { RefLike } from '../../ref'

declare const ComputedRefSymbol: unique symbol
export interface ComputedRef<T> extends Readonly<RefLike<T>> {
  readonly [ComputedRefSymbol]: true
}
export interface WritableComputedRef<T> extends RefLike<T> {
  readonly [ComputedRefSymbol]: true
}
export type UnwrapComputedRef<
  T extends ComputedRef<unknown> | WritableComputedRef<unknown>
> = T extends ComputedRef<infer U>
  ? U
  : T extends WritableComputedRef<infer U>
    ? U
    : never
