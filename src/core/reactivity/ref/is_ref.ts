import Ref from './Ref.class'
import type * as Typedef from './typedef'

function isRef(value: unknown): value is Typedef.Ref<unknown> {
  return Ref.isRef(value)
}

export default isRef
