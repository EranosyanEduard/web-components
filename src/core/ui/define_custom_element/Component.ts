import isFunction from 'es-toolkit/compat/isFunction'
import isObject from 'es-toolkit/compat/isObject'
import { type html, render } from 'lit-html'
import { reactive, watchEffect } from '../../reactivity'
import type { Getter } from '../../typedef'
import { setCurrentInstance } from './current_instance'
import type Prop from './Prop'
import type { ComponentOptions, CurrentInstance } from './typedef'

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
  constructor(args: {
    readonly componentOptions: ComponentOptions<Props, Emits>
    readonly propsOptions: { readonly [P in keyof Props]: Prop<Props[P]> }
  }) {
    const { componentOptions, propsOptions } = args
    super()
    this.$options = {
      componentOptions,
      setup: {
        hooks: {
          onBeforeMount: new Set(),
          onBeforeUpdate: new Set(),
          onMounted: new Set(),
          onUnmounted: new Set(),
          onUpdated: new Set()
        },
        props: this.#defineProps(propsOptions),
        provides: new Map()
      }
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

  #defineProps(
    propsOptions: { readonly [P in keyof Props]: Prop<Props[P]> }
  ): Props {
    const propsValues = new Proxy(reactive({}), {
      get: (target, prop, receiver) => {
        return (
          Reflect.get(target, prop, receiver) ??
          // @ts-expect-error проигнорировать ошибку типизации:
          // prop станет ключом propsValues при выполнении программы.
          propsOptions[prop].options.default()
        )
      },
      set: (target, prop, newValue, receiver) => {
        // @ts-expect-error проигнорировать ошибку типизации:
        // см. коммент в методе get.
        const propOptions = propsOptions[prop]
        const propValue = newValue ?? propOptions.options.default()
        if (propOptions.options.validator(propValue)) {
          if (isFunction(propOptions.options.reflector)) {
            // @ts-expect-error проигнорировать ошибку типизации:
            // см. коммент в методе get.
            this.setAttribute(prop, propOptions.options.reflector(newValue))
          }
          return Reflect.set(target, prop, newValue, receiver)
        }
        return false
      }
    })
    Object.defineProperties(
      this,
      Object.keys(propsOptions).reduce<Record<string, PropertyDescriptor>>(
        (acc, propName) => {
          const propOptions = propsOptions[propName]
          acc[`:${propName}`] = {
            get: () => {
              // @ts-expect-error проигнорировать ошибку типизации:
              // propName станет ключом propsValues при выполнении программы.
              return propsValues[propName]
            },
            set: (propValue: unknown) => {
              // @ts-expect-error проигнорировать ошибку типизации:
              // см. коммент в методе get.
              propsValues[propName] = propValue
            }
          }
          if (!propOptions.options.required) {
            // @ts-expect-error проигнорировать ошибку типизации:
            // см. коммент к методу get PropertyDescriptor.
            propsValues[propName] = propOptions.options.default()
          }
          return acc
        },
        {}
      )
    )
    // @ts-expect-error проигнорировать ошибку типизации:
    // код метода должен гарантировать соответствие значения
    // props возвращаемому типу.
    return propsValues
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
    const {
      componentOptions: { shadowRootConfig }
    } = this.$options
    return isObject(shadowRootConfig)
      ? this.attachShadow(shadowRootConfig)
      : this
  }

  #defineTemplate(): Getter<ReturnType<typeof html>> {
    const {
      componentOptions: { setup },
      setup: { props }
    } = this.$options
    // @ts-expect-error проигнорировать ошибку типизации:
    // невозможно устранить ошибку типизации, но в данном
    // случае это не повлияет на корректность работы кода.
    setCurrentInstance(this)
    try {
      return setup(props, { emit: this.#emit.bind(this) })
    } finally {
      setCurrentInstance(null)
    }
  }

  #emit(eventType: Emits, detail?: unknown) {
    const {
      componentOptions: { emits = [] }
    } = this.$options
    if (emits.includes(eventType)) {
      this.dispatchEvent(new CustomEvent(eventType, { detail }))
    }
  }

  #useLifecycleHooks(args: {
    readonly clear?: boolean
    readonly hook: keyof CurrentInstance<
      Props,
      Emits
    >['$options']['setup']['hooks']
  }) {
    const { clear = true, hook } = args
    const {
      setup: { hooks }
    } = this.$options
    const concreteHooks = hooks[hook]
    concreteHooks.forEach((hook_) => {
      hook_()
    })
    if (clear) concreteHooks.clear()
  }
}

export default Component
