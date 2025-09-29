import noop from 'es-toolkit/compat/noop'
import type { Maybe } from '../../typedef'

/**
 * Эффект, необходимый для реализации системы реактивности.
 * @since 1.0.0
 * @version 1.0.0
 */
class Effect {
  /** Активный эффект */
  static current: Maybe<Effect> = null

  #destroyed: boolean

  readonly #ondestroy: Set<(e: Effect) => void>

  readonly #value: VoidFunction

  constructor(value: VoidFunction) {
    this.#destroyed = false
    this.#ondestroy = new Set()
    this.#value = value
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
    Effect.current = this
    try {
      this.#value()
    } finally {
      Effect.current = null
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
