import { getCurrentInstance } from '../current_instance'

function onBeforeMount(f: VoidFunction): void {
  getCurrentInstance()?.$options.hooks.onBeforeMount.add(f)
}

export default onBeforeMount
