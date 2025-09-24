import isObject from 'es-toolkit/compat/isObject'
import kebabCase from 'es-toolkit/compat/kebabCase'
import mapValues from 'es-toolkit/compat/mapValues'
import { render } from 'lit-html'
import { reactive, watchEffect } from '../../reactivity'
import Prop from './Prop'
import type { ComponentOptions, PropsOptions } from './typedef'

function defineComponent<
  Props extends Record<string, unknown> = Record<string, unknown>
>(options: ComponentOptions<Props>): CustomElementConstructor {
  const {
    name,
    props: propsOptions = {} as PropsOptions<Props>,
    setup,
    shadowRootConfig = null
  } = options
  const Component = class extends HTMLElement {
    private readonly template: ReturnType<typeof setup>

    constructor() {
      super()
      this.template = setup(this.defineProps())
    }

    connectedCallback(): void {
      this.defineRender()
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
      const root = this.defineRoot()
      watchEffect(() => render(this.template(), root))
    }

    private defineRoot(): this | ShadowRoot {
      return isObject(shadowRootConfig)
        ? this.attachShadow(shadowRootConfig)
        : this
    }
  }
  customElements.define(kebabCase(name), Component)
  return Component
}

export default defineComponent
