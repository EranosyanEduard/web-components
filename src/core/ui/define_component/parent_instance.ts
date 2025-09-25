import type { Accessor } from '../../typedef'
import type { CurrentInstance } from './typedef'

let parentInstance_: CurrentInstance<Record<string, unknown>, string> | null =
  null
const parentInstance: Accessor<CurrentInstance<
  Record<string, unknown>,
  string
> | null> = {
  get: () => parentInstance_,
  set: (instance) => {
    parentInstance_ = instance
  }
}
const getParentInstance = parentInstance.get
const setParentInstance = parentInstance.set

export { getParentInstance, setParentInstance }
