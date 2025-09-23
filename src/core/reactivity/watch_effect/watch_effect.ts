import { Effect } from '../effect'

function watchEffect(effect: VoidFunction): VoidFunction {
  return new Effect(effect).use()
}

export default watchEffect
