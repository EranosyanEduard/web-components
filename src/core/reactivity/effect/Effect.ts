import noop from 'es-toolkit/compat/noop'
import type { Accessor, Maybe } from '../../typedefs'

let accessor_: Maybe<Effect> = null
/** Активный эффект */
const activeEffect: Accessor<Maybe<Effect>> = {
  get: () => accessor_,
  set: (value) => {
    accessor_ = value
  }
}

/**
 * Эффект, необходимый для реализации системы реактивности.
 * @since 1.0.0
 * @version 1.0.0
 */
class Effect {
  static readonly getActive = activeEffect.get

  #destroyed: boolean

  readonly #effect: VoidFunction

  readonly #ondestroy: Set<(e: Effect) => void>

  constructor(value: VoidFunction) {
    this.#destroyed = false
    this.#effect = value
    this.#ondestroy = new Set()
  }

  ondestroy(ondestroy: (e: Effect) => void): void {
    if (!this.#destroyed) {
      this.#ondestroy.add(ondestroy)
    }
  }

  use(): VoidFunction {
    if (this.#destroyed) {
      return noop
    }
    activeEffect.set(this)
    try {
      this.#effect()
    } finally {
      activeEffect.set(null)
    }
    return () => {
      if (!this.#destroyed) {
        this.#destroyed = true
        this.#ondestroy.forEach((ondestroy) => {
          ondestroy(this)
        })
      }
    }
  }
}

export default Effect
