import { getCurrentInstance } from '../current_instance'

function onMounted(f: VoidFunction): void {
  getCurrentInstance()?.$options.hooks.onMounted.add(f)
}

export default onMounted
