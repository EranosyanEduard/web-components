import type { RefLike } from './RefLike'

declare const RefSymbol: unique symbol
export interface Ref<T> extends RefLike<T> {
  readonly [RefSymbol]: true
}
export type UnwrapRef<T extends Ref<unknown>> = T extends Ref<infer U>
  ? U
  : never
