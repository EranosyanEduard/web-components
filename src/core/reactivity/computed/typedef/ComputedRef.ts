import type { RefTypedef } from '../../ref'
import type { ComputedRefSymbol } from './ComputedRefSymbol'

export type ComputedRef<T> = Readonly<RefTypedef.RefLike<T>> & {
  readonly [ComputedRefSymbol]: true
}
export type WritableComputedRef<T> = RefTypedef.RefLike<T> & {
  readonly [ComputedRefSymbol]: true
}
