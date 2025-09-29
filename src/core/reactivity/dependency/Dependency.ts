import isEmpty from 'es-toolkit/compat/isEmpty'
import isNull from 'es-toolkit/compat/isNull'
import { Effect } from '../effect'

const MagicProps = Object.freeze({
  TRACK_ALL: Symbol()
} satisfies Record<string, symbol>)

/**
 * Хранилище эффектов, необходимое для реализации системы реактивности.
 * @since 1.0.0
 * @version 1.0.0
 */
class Dependency {
  readonly #effects = new Map<PropertyKey, Set<Effect>>()

  readonly #ondestroyEffects = new WeakMap<Effect, Set<PropertyKey>>()

  track(prop: PropertyKey): void {
    if (isNull(Effect.current)) return
    if (this.#effects.has(prop)) {
      this.#effects.get(prop)?.add(Effect.current)
    } else {
      this.#effects.set(prop, new Set([Effect.current]))
    }
    this.#ondestroyEffect({
      effect: Effect.current,
      prop
    })
  }

  trackAll(): void {
    this.track(MagicProps.TRACK_ALL)
  }

  trigger(prop: PropertyKey): void {
    if (!this.#effects.has(prop) && !this.#effects.has(MagicProps.TRACK_ALL)) {
      return
    }
    this.#effects.get(prop)?.forEach((effect) => {
      effect.use()
    })
    this.#effects.get(MagicProps.TRACK_ALL)?.forEach((effect) => {
      effect.use()
    })
  }

  #ondestroyEffect(args: {
    readonly effect: Effect
    readonly prop: PropertyKey
  }): void {
    const { effect, prop } = args
    const effectForProps = this.#ondestroyEffects.get(effect) ?? new Set()
    if (effectForProps.has(prop)) {
      return
    }
    this.#ondestroyEffects.set(effect, effectForProps.add(prop))
    effect.ondestroy(() => {
      if (!this.#effects.has(prop)) {
        return
      }
      const effectsForProp = this.#effects.get(prop)
      effectsForProp?.delete(effect)
      if (isEmpty(effectsForProp)) {
        this.#effects.delete(prop)
      }
    })
  }
}

export default Dependency
