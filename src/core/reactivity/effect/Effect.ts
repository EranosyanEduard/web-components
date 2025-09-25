import type { Maybe } from '../../typedef'

class Effect {
  /** Активный эффект */
  static current: Maybe<Effect> = null

  private readonly ondestroyListeners: Set<(effect: Effect) => void>

  private readonly value: VoidFunction

  constructor(value: VoidFunction) {
    this.ondestroyListeners = new Set()
    this.value = value
  }

  ondestroy(listener: (effect: Effect) => void): void {
    this.ondestroyListeners.add(listener)
  }

  run(): void {
    this.value()
  }

  use(): VoidFunction {
    Effect.current = this
    try {
      Effect.current.run()
    } finally {
      Effect.current = null
    }
    return this.destroy.bind(this)
  }

  private destroy(): void {
    this.ondestroyListeners.forEach((listener) => {
      listener(this)
    })
  }
}

export default Effect
