import { getCurrentInstance } from '../current_instance'

function onBeforeUpdate(f: VoidFunction): void {
  getCurrentInstance()?.$options.hooks.onBeforeUpdate.add(f)
}

export default onBeforeUpdate
