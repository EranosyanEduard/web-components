export declare const ReactiveSymbol: unique symbol
export type Reactive<T extends object> = T & { readonly [ReactiveSymbol]: true }
