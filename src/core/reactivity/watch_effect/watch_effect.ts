import { Effect } from '../effect'

/**
 * Создать эффект.
 * @returns функцию, уничтожающую эффект.
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * const counter = ref(0)
 * const stopEffect = watchEffect(() => {
 *   console.log(`count is ${counter.value}`)
 * })
 * counter.value++ // -> count is 1
 * counter.value++ // -> count is 2
 * counter.value++ // -> count is 3
 * stopEffect()
 * counter.value++
 * counter.value++
 * counter.value++
 */
function watchEffect(effect: VoidFunction): VoidFunction {
  return new Effect(effect).use()
}

export default watchEffect
