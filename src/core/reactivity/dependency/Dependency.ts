import isEmpty from 'es-toolkit/compat/isEmpty'
import isNull from 'es-toolkit/compat/isNull'
import type { Dictionary } from 'ts-essentials'
import { Effect } from '../effect'

/** Коллекция служебных ключей */
const MagicPropertyKey = Object.freeze({
  TRACK_ALL: Symbol()
} satisfies Dictionary<symbol>)

/**
 * Хранилище эффектов, необходимое для реализации системы реактивности.
 * @since 1.0.0
 * @version 1.0.0
 */
class Dependency {
  readonly #effects = new Map<PropertyKey, Set<Effect>>()

  readonly #ondestroyEffects = new WeakMap<Effect, Set<PropertyKey>>()

  track(p: PropertyKey): void {
    const activeEffect = Effect.getActive()
    if (isNull(activeEffect)) return
    if (this.#effects.has(p)) {
      this.#effects.get(p)?.add(activeEffect)
    } else {
      this.#effects.set(p, new Set([activeEffect]))
    }
    this.#ondestroyEffect({ e: activeEffect, p })
  }

  trackAll(): void {
    this.track(MagicPropertyKey.TRACK_ALL)
  }

  trigger(p: PropertyKey): void {
    this.#trigger(p)
    this.triggerAll()
  }

  triggerAll(): void {
    this.#trigger(MagicPropertyKey.TRACK_ALL)
  }

  #ondestroyEffect(args: {
    readonly e: Effect
    readonly p: PropertyKey
  }): void {
    const { e, p } = args
    const effectForProps = this.#ondestroyEffects.get(e) ?? new Set()
    if (effectForProps.has(p)) {
      return
    }
    this.#ondestroyEffects.set(e, effectForProps.add(p))
    e.ondestroy(() => {
      if (!this.#effects.has(p)) {
        return
      }
      const effectsForProp = this.#effects.get(p)
      effectsForProp?.delete(e)
      if (isEmpty(effectsForProp)) {
        this.#effects.delete(p)
      }
    })
  }

  #trigger(p: PropertyKey): void {
    if (this.#effects.has(p)) {
      for (const e of this.#effects.get(p)!) {
        e.use()
      }
    }
  }
}

export default Dependency
