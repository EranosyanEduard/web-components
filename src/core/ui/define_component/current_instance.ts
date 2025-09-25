import type { Accessor, Maybe } from '../../typedef'
import type { CurrentInstance } from './typedef'

type MaybeCurrentInstance = Maybe<
  CurrentInstance<Record<string, unknown>, string>
>
let instance: MaybeCurrentInstance = null
const currentInstance: Accessor<MaybeCurrentInstance> = {
  get: () => instance,
  set: (context) => {
    instance = context
  }
}
const getCurrentInstance = currentInstance.get
const setCurrentInstance = currentInstance.set

export { getCurrentInstance, setCurrentInstance }
