export interface Accessor<T> {
  readonly get: () => T
  readonly set: (value: T) => void
}
