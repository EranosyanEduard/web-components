import type { Getter } from '../../../typedef'

declare const InjectionKeySymbol: unique symbol
export type InjectionKey<T> = symbol & { [InjectionKeySymbol]?: T }
export interface DependencyInjection<T> {
  readonly inject: (key: InjectionKey<T>, value: Getter<T>) => T
  readonly provide: (key: InjectionKey<T>, value: T) => void
}
