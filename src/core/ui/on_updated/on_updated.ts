import { getCurrentInstance } from '../current_instance'

function onUpdated(f: VoidFunction): void {
  getCurrentInstance()?.$options.hooks.onUpdated.add(f)
}

export default onUpdated
