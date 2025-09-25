import type { Accessor } from '../../typedef'
import type { CurrentInstance } from './typedef'

let instance: CurrentInstance<Record<string, unknown>, string> | null = null
const currentInstance: Accessor<CurrentInstance<
  Record<string, unknown>,
  string
> | null> = {
  get: () => instance,
  set: (context) => {
    instance = context
  }
}
const getCurrentInstance = currentInstance.get
const setCurrentInstance = currentInstance.set

export { getCurrentInstance, setCurrentInstance }
