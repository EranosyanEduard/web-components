import { Effect } from '../effect'

/**
 * Создать эффект.
 * @returns функцию, уничтожающую эффект.
 * @since 1.0.0
 * @version 1.0.0
 */
function watchEffect(effect: VoidFunction): VoidFunction {
  return new Effect(effect).use()
}

export default watchEffect
