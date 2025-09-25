import isObject from 'es-toolkit/compat/isObject'
import kebabCase from 'es-toolkit/compat/kebabCase'
import mapValues from 'es-toolkit/compat/mapValues'
import { render } from 'lit-html'
import { reactive, watchEffect } from '../../reactivity'
import { type CurrentInstance, setCurrentInstance } from '../current_instance'
import Prop from './Prop'
import type { ComponentOptions, PropsOptions } from './typedef'

function defineComponent<
  Props extends Record<string, unknown> = Record<string, unknown>,
  Emits extends string = string
>(options: ComponentOptions<Props, Emits>): CustomElementConstructor {
  const {
    name,
    emits = [] as [],
    props: propsOptions = {} as PropsOptions<Props>,
    setup,
    shadowRootConfig = null
  } = options
  const Component = class extends HTMLElement implements CurrentInstance {
    readonly $options: CurrentInstance['$options']

    private readonly root: this | ShadowRoot

    private readonly template: ReturnType<typeof setup>

    /** created */
    constructor() {
      super()
      this.$options = {
        hooks: {
          onBeforeMount: new Set(),
          onBeforeUpdate: new Set(),
          onMounted: new Set(),
          onUnmounted: new Set(),
          onUpdated: new Set()
        }
      }
      this.root = this.defineRoot()
      this.template = this.defineTemplate()
      this.$options.hooks.onMounted.add(this.defineRender.bind(this))
      this.useLifecycleHooks({ hook: 'onBeforeMount' })
    }

    /** mounted */
    connectedCallback(): void {
      this.useLifecycleHooks({ hook: 'onMounted' })
    }

    /** destroyed */
    disconnectedCallback(): void {
      this.useLifecycleHooks({ hook: 'onUnmounted' })
    }

    private defineProps(): Props {
      const props = reactive({})
      Object.defineProperties(
        this,
        mapValues(propsOptions, (propOptions, propName) => {
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
        })
      )
      // @ts-expect-error проигнорировать ошибку типизации:
      // код метода должен гарантировать соответствие значения
      // props возвращаемому типу.
      return props
    }

    private defineRender(): void {
      let rendered = false
      watchEffect(() => {
        if (rendered) {
          this.useLifecycleHooks({
            clear: false,
            hook: 'onBeforeUpdate'
          })
        }
        render(this.template(), this.root)
        if (rendered) {
          this.useLifecycleHooks({
            clear: false,
            hook: 'onUpdated'
          })
        }
        rendered = true
      })
    }

    private defineRoot(): this | ShadowRoot {
      return isObject(shadowRootConfig)
        ? this.attachShadow(shadowRootConfig)
        : this
    }

    private defineTemplate(): ReturnType<typeof setup> {
      setCurrentInstance(this)
      try {
        return setup(this.defineProps(), { emit: this.emit.bind(this) })
      } finally {
        setCurrentInstance(null)
      }
    }

    private emit(eventType: Emits, detail?: unknown) {
      if (!emits.includes(eventType)) return
      this.dispatchEvent(new CustomEvent(eventType, { detail }))
    }

    private useLifecycleHooks(args: {
      readonly clear?: boolean
      readonly hook: keyof CurrentInstance['$options']['hooks']
    }) {
      const { clear = true, hook } = args
      const hooks = this.$options.hooks[hook]
      hooks.forEach((it) => {
        it()
      })
      if (clear) hooks.clear()
    }
  }
  customElements.define(kebabCase(name), Component)
  return Component
}

export default defineComponent
