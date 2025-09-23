import { computed, ref, watch, watchEffect } from './core/reactivity'

export function setupCounter(element: HTMLButtonElement) {
  const counter = ref(0)
  const innerHTML = computed<string>({
    get: () => `Count: ${counter.value}`,
    set: () => {
      counter.value++
    }
  })
  watch(counter, console.log)
  watch(innerHTML, console.log)
  watch(() => counter.value, console.log)
  watchEffect(() => {
    element.innerHTML = innerHTML.value
  })
  element.addEventListener('click', () => {
    innerHTML.value = ''
  })
}
