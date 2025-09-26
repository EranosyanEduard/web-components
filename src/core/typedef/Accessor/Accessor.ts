/**
 * Свойство доступа.
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * interface Context {
 *   readonly use: VoidFunction
 * }
 *
 * const context_: Context | null = null
 * const context: Accessor<Context | null> = {
 *   get: () => context_,
 *   set: (value) => {
 *     context_ = value
 *   }
 * }
 */
export interface Accessor<T> {
  readonly get: Getter<T>
  readonly set: Setter<T>
}
export type Getter<T> = () => T
export type Setter<T> = (value: T) => void
