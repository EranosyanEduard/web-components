import { Effect } from '../effect'

/**
 * Создать эффект.
 * @returns функцию, уничтожающую эффект.
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * const counter = ref(0)
 * const effect = () => {
 *   console.log(`count is ${counter.value}`)
 * }
 * const stopEffect = watchEffect(effect) // -> count is 0
 * counter.value++                        // -> count is 1
 * counter.value++                        // -> count is 2
 * counter.value++                        // -> count is 3
 * stopEffect()
 * counter.value++                        // no effect
 */
function watchEffect(effect: VoidFunction): VoidFunction {
  return new Effect(effect).use()
}

export default watchEffect
