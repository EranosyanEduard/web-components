import isEmpty from 'es-toolkit/compat/isEmpty'
import isNull from 'es-toolkit/compat/isNull'
import { Effect } from '../effect'

class Dependency<T extends object> {
  static readonly #MagicProps = Object.freeze({
    TRACK_ALL: Symbol()
  } satisfies Record<string, symbol>)

  readonly #effects: Map<keyof T, Set<Effect>>

  readonly #effectsForProps: WeakMap<Effect, Set<keyof T>>

  constructor() {
    this.#effects = new Map()
    this.#effectsForProps = new WeakMap()
  }

  track(prop: keyof T): void {
    if (isNull(Effect.current)) return
    if (this.#effects.has(prop)) {
      this.#effects.get(prop)?.add(Effect.current)
    } else {
      this.#effects.set(prop, new Set([Effect.current]))
    }
    if (this.#effectsForProps.has(Effect.current)) {
      this.#effectsForProps.get(Effect.current)?.add(prop)
    } else {
      this.#effectsForProps.set(Effect.current, new Set([prop]))
      Effect.current.ondestroy(this.#cleanup.bind(this))
    }
  }

  trackAll(): void {
    // @ts-expect-error проигнорировать ошибку типизации:
    // умышленно нарушить типизацию аргумента метода для
    // реализации нестандартного поведения - наблюдения за
    // всеми свойствами объекта.
    this.track(Dependency.#MagicProps.TRACK_ALL)
  }

  trigger(prop: keyof T): void {
    if (!this.#effects.has(prop)) return
    this.#effects.get(prop)?.forEach((effect) => {
      effect.run()
    })
    // @ts-expect-error проигнорировать ошибку типизации:
    // см. комментарий в методе trackAll.
    this.#effects.get(Dependency.#MagicProps.TRACK_ALL)?.forEach((effect) => {
      effect.run()
    })
  }

  #cleanup(effect: Effect): void {
    if (!this.#effectsForProps.has(effect)) return
    this.#effectsForProps.get(effect)?.forEach((prop) => {
      if (!this.#effects.has(prop)) return
      const effectsForProp = this.#effects.get(prop)
      effectsForProp?.delete(effect)
      if (isEmpty(effectsForProp)) {
        this.#effects.delete(prop)
      }
    })
    this.#effectsForProps.delete(effect)
  }
}

export default Dependency
