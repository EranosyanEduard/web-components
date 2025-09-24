import type { RefLike } from '../../ref'

export declare const ComputedRefSymbol: unique symbol
export type ComputedRef<T> = Readonly<RefLike<T>> & {
  readonly [ComputedRefSymbol]: true
}
export type WritableComputedRef<T> = RefLike<T> & {
  readonly [ComputedRefSymbol]: true
}
