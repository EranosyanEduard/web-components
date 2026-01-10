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
  readonly get: AccessorGet<T>
  readonly set: AccessorSet<T>
}
export type AccessorGet<T> = () => T
export type AccessorSet<T> = (value: T) => void
