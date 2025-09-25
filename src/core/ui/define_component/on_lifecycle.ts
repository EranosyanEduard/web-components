import { type CurrentInstance, getCurrentInstance } from '../current_instance'

function onLifecycleHook(
  hook: keyof CurrentInstance['$options']['hooks']
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
