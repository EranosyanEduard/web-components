import type { Accessor } from '../../typedef'
import type { CurrentInstance } from '../current_instance'

let parentInstance_: CurrentInstance | null = null
const parentInstance: Accessor<CurrentInstance | null> = {
  get: () => parentInstance_,
  set: (instance) => {
    parentInstance_ = instance
  }
}
const getParentInstance = parentInstance.get
const setParentInstance = parentInstance.set

export { getParentInstance, setParentInstance }
