import { isObject } from 'es-toolkit/compat'
import _mapValues from 'es-toolkit/compat/mapValues'
import { type html, render } from 'lit-html'
import { reactive, watchEffect } from '../../reactivity'
import type { Getter } from '../../typedef'
import { setCurrentInstance } from './current_instance'
import Prop from './Prop'
import type { ComponentOptions, CurrentInstance, PropsOptions } from './typedef'

/**
 * Веб-компонент.
 * @since 1.0.0
 * @version 1.0.0
 */
class Component<
    Props extends Record<string, unknown> = Record<string, unknown>,
    Emits extends string = string
  >
  extends HTMLElement
  implements CurrentInstance<Props, Emits>
{
  readonly $options: CurrentInstance<Props, Emits>['$options']

  /** created */
  constructor(componentOptions: ComponentOptions<Props, Emits>) {
    super()
    this.$options = {
      componentOptions,
      hooks: {
        onBeforeMount: new Set(),
        onBeforeUpdate: new Set(),
        onMounted: new Set(),
        onUnmounted: new Set(),
        onUpdated: new Set()
      },
      props: this.#defineProps(componentOptions.props),
      provides: new Map()
    }
  }

  /** mounted */
  connectedCallback(): void {
    this.#defineRender()
  }

  /** destroyed */
  disconnectedCallback(): void {
    this.#useLifecycleHooks({ hook: 'onUnmounted' })
  }

  #defineProps(propsOptions?: PropsOptions<Props>): Props {
    const props = reactive({})
    Object.defineProperties(
      this,
      _mapValues(propsOptions, (propOptions, propName) => {
        const prop = new Prop(propName, propOptions)
        const valueOrDefault = (propValue: unknown): Props[keyof Props] => {
          // @ts-expect-error проигнорировать ошибку типизации:
          // невозможно гарантировать, что значение propValue
          // соответствует возвращаемому типу функции, но в данном
          // случае это не повлияет на корректность работы кода.
          return propValue ?? prop.options.default()
        }
        if (!prop.options.required) {
          // @ts-expect-error проигнорировать ошибку типизации:
          // propName станет ключом props при выполнении программы.
          props[propName] = valueOrDefault(null)
        }
        return {
          get: () => {
            // @ts-expect-error проигнорировать ошибку типизации:
            // propName станет ключом props при выполнении программы.
            return valueOrDefault(props[propName])
          },
          set: (propValue: unknown) => {
            const propValue_ = valueOrDefault(propValue)
            if (prop.options.validator(propValue_)) {
              // @ts-expect-error проигнорировать ошибку типизации:
              // см. комментарий в методе `get`.
              props[propName] = propValue_
            }
          }
        }
      })
    )
    // @ts-expect-error проигнорировать ошибку типизации:
    // код метода должен гарантировать соответствие значения
    // props возвращаемому типу.
    return props
  }

  #defineRender(): void {
    const root = this.#defineRoot()
    const template = this.#defineTemplate()
    let rendered = false
    const effect: VoidFunction = () => {
      if (rendered) {
        this.#useLifecycleHooks({
          clear: false,
          hook: 'onBeforeUpdate'
        })
      }
      render(template(), root)
      if (rendered) {
        this.#useLifecycleHooks({
          clear: false,
          hook: 'onUpdated'
        })
      }
      rendered = true
    }
    this.#useLifecycleHooks({ hook: 'onBeforeMount' })
    watchEffect(effect)
    this.#useLifecycleHooks({ hook: 'onMounted' })
  }

  #defineRoot(): this | ShadowRoot {
    return isObject(this.$options.componentOptions.shadowRootConfig)
      ? this.attachShadow(this.$options.componentOptions.shadowRootConfig)
      : this
  }

  #defineTemplate(): Getter<ReturnType<typeof html>> {
    // @ts-expect-error проигнорировать ошибку типизации:
    // невозможно устранить ошибку типизации, но в данном
    // случае это не повлияет на корректность работы кода.
    setCurrentInstance(this)
    try {
      return this.$options.componentOptions.setup(this.$options.props, {
        emit: this.#emit.bind(this)
      })
    } finally {
      setCurrentInstance(null)
    }
  }

  #emit(eventType: Emits, detail?: unknown) {
    if (!this.$options.componentOptions.emits?.includes(eventType)) return
    this.dispatchEvent(new CustomEvent(eventType, { detail }))
  }

  #useLifecycleHooks(args: {
    readonly clear?: boolean
    readonly hook: keyof CurrentInstance<Props, Emits>['$options']['hooks']
  }) {
    const { clear = true, hook } = args
    const hooks = this.$options.hooks[hook]
    hooks.forEach((it) => {
      it()
    })
    if (clear) hooks.clear()
  }
}

export default Component
