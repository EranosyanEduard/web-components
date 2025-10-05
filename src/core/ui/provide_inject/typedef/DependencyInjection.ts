import type { Getter } from '../../../typedef'

declare const InjectionKeySymbol: unique symbol
export type InjectionKey<T> = symbol & { [InjectionKeySymbol]?: T }
/**
 * Распаковать значение зависимости.
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * const APP_THEME_DEPENDENCY: InjectionKey<{
 *   readonly dark: boolean
 *   readonly light: boolean
 * }> = Symbol()
 * type AppTheme = UnwrapInjectionKey<typeof APP_THEME_DEPENDENCY>
 * //   ^ { readonly dark: boolean; readonly light: boolean }
 */
export type UnwrapInjectionKey<T extends InjectionKey<unknown>> =
  T extends InjectionKey<infer U> ? U : never
export interface DependencyInjection<T> {
  readonly inject: ((key: InjectionKey<T>) => T | null) &
    ((key: InjectionKey<T>, value: Getter<T>) => T)
  readonly provide: (key: InjectionKey<T>, value: T) => void
}
