import Computed from './Computed.class'
import type * as Typedef from './typedef'

function isComputedRef(value: unknown): value is Typedef.ComputedRef<unknown> {
  return Computed.isComputed(value)
}

export default isComputedRef
