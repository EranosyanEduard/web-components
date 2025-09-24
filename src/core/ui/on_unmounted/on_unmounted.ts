import { getCurrentInstance } from '../current_instance'

function onUnmounted(f: VoidFunction): void {
  getCurrentInstance()?.$options.hooks.onUnmounted.add(f)
}

export default onUnmounted
