declare const ReactiveSymbol: unique symbol
export type Reactive<T extends object> = T & { readonly [ReactiveSymbol]: true }
export type UnwrapReactive<T extends Reactive<object>> = T extends Reactive<
  infer U
>
  ? U
  : never
