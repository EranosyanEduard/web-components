import type { RefLike } from './RefLike'

export declare const RefSymbol: unique symbol
export type Ref<T> = RefLike<T> & { readonly [RefSymbol]: true }
