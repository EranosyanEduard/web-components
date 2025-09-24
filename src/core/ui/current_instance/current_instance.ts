import type { Accessor } from '../../typedef'
import type { CurrentInstance } from './typedef'

let instance: CurrentInstance | null = null
const currentInstance: Accessor<CurrentInstance | null> = {
  get: () => instance,
  set: (context) => {
    instance = context
  }
}
const getCurrentInstance = currentInstance.get
const setCurrentInstance = currentInstance.set

export { getCurrentInstance, setCurrentInstance }
