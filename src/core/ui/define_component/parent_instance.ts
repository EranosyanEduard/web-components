import type { Accessor, Maybe } from '../../typedef'
import type { CurrentInstance } from './typedef'

type MaybeCurrentInstance = Maybe<
  CurrentInstance<Record<string, unknown>, string>
>
let parentInstance_: MaybeCurrentInstance = null
const parentInstance: Accessor<MaybeCurrentInstance> = {
  get: () => parentInstance_,
  set: (instance) => {
    parentInstance_ = instance
  }
}
const getParentInstance = parentInstance.get
const setParentInstance = parentInstance.set

export { getParentInstance, setParentInstance }
