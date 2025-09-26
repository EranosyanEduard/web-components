import { isObject } from 'es-toolkit/compat'
import mapValues from 'es-toolkit/compat/mapValues'
import { type html, render } from 'lit-html'
import { reactive, watchEffect } from '../../reactivity'
import type { Getter } from '../../typedef'
import { setCurrentInstance } from './current_instance'
import Prop from './Prop'
import { getParentInstance, setParentInstance } from './parent_instance'
import type { ComponentOptions, CurrentInstance } from './typedef'

class Component<
    Props extends Record<string, unknown> = Record<string, unknown>,
    Emits extends string = string
  >
  extends HTMLElement
  implements CurrentInstance<Props, Emits>
{
  readonly $options: CurrentInstance<Props, Emits>['$options']

  readonly #root: this | ShadowRoot

  readonly #template: Getter<ReturnType<typeof html>>

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
      parent: getParentInstance(),
      provides: new Map()
    }
    this.#root = this.#defineRoot()
    this.#template = this.#defineTemplate()
    this.$options.hooks.onMounted.add(this.#defineRender.bind(this))
    this.#useLifecycleHooks({ hook: 'onBeforeMount' })
  }

  /** mounted */
  connectedCallback(): void {
    this.#useLifecycleHooks({ hook: 'onMounted' })
  }

  /** destroyed */
  disconnectedCallback(): void {
    this.#useLifecycleHooks({ hook: 'onUnmounted' })
  }

  #defineProps(): Props {
    const props = reactive({})
    Object.defineProperties(
      this,
      mapValues(
        this.$options.componentOptions.props,
        (propOptions, propName) => {
          const prop = new Prop(propName, propOptions)
          const valueOrDefault = (propValue: unknown): Props[keyof Props] => {
            // @ts-expect-error проигнорировать ошибку типизации:
            // невозможно гарантировать, что значение propValue
            // соответствует возвращаемому типу функции, но в данном
            // случае это не повлияет на корректность работы кода.
            return propValue ?? prop.options.default()
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
        }
      )
    )
    // @ts-expect-error проигнорировать ошибку типизации:
    // код метода должен гарантировать соответствие значения
    // props возвращаемому типу.
    return props
  }

  #defineRender(): void {
    let rendered = false
    watchEffect(() => {
      // @ts-expect-error проигнорировать ошибку типизации:
      // невозможно устранить ошибку типизации, но в данном
      // случае это не повлияет на корректность работы кода.
      setParentInstance(this)
      if (rendered) {
        this.#useLifecycleHooks({
          clear: false,
          hook: 'onBeforeUpdate'
        })
      }
      render(this.#template(), this.#root)
      if (rendered) {
        this.#useLifecycleHooks({
          clear: false,
          hook: 'onUpdated'
        })
        setParentInstance(null)
      } else {
        setParentInstance(this.$options.parent)
      }
      rendered = true
    })
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
      return this.$options.componentOptions.setup(this.#defineProps(), {
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
