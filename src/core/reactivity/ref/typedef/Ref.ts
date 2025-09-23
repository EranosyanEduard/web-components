import type { RefLike } from './RefLike'
import type { RefSymbol } from './RefSymbol'

export type Ref<T> = RefLike<T> & { readonly [RefSymbol]: true }
