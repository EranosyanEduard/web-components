import { getCurrentInstance } from './current_instance'
import type { CurrentInstance } from './typedef'

function onLifecycleHook(
  hook: keyof CurrentInstance<
    Record<string, unknown>,
    string
  >['$options']['hooks']
): (cb: VoidFunction) => void {
  return (cb) => {
    getCurrentInstance()?.$options.hooks[hook].add(cb)
  }
}
const onBeforeMount = onLifecycleHook('onBeforeMount')
const onBeforeUpdate = onLifecycleHook('onBeforeUpdate')
const onMounted = onLifecycleHook('onMounted')
const onUnmounted = onLifecycleHook('onUnmounted')
const onUpdated = onLifecycleHook('onUpdated')
export { onBeforeMount, onBeforeUpdate, onMounted, onUnmounted, onUpdated }
