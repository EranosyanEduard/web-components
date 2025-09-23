import type { ReactiveSymbol } from './ReactiveSymbol'

export type Reactive<T extends object> = T & { readonly [ReactiveSymbol]: true }
