export interface Accessor<T> {
  readonly get: Getter<T>
  readonly set: Setter<T>
}
export type Getter<T> = () => T
export type Setter<T> = (value: T) => void
