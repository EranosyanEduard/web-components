/**
 * _Nullable_-значение.
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * function getOrNull<T>(values: readonly T[], index: number): Maybe<T> {
 *   return values[index] ?? null
 * }
 */
export type Maybe<T> = T | null
