import kebabCase from 'es-toolkit/compat/kebabCase'
import mapValues from 'es-toolkit/compat/mapValues'
import Component from './Component'
import Prop from './Prop'
import type { ComponentOptions, PropsOptions } from './typedef'

/**
 * Создать веб-компонент.
 * @returns конструктор веб-компонента.
 * @since 1.0.0
 * @version 1.0.0
 */
function defineComponent<
  Props extends Record<string, unknown> = Record<string, unknown>,
  Emits extends string = string
>(
  componentOptions: ComponentOptions<Props, Emits>
): {
  readonly emits: Emits[]
  readonly props: PropsOptions<Props>
  new (): Component<Props, Emits>
} {
  const { emits = [], name, props = {} } = componentOptions
  const propsOptions = mapValues(
    props,
    (propOptions, propName) => new Prop(propName, propOptions)
  )
  const Component_ = class extends Component<Props, Emits> {
    static readonly emits = emits

    static readonly props = props

    constructor() {
      super({
        componentOptions,
        // @ts-expect-error проигнорировать ошибку типизации:
        // невозможно устранить ошибку типизации, но в данном случае
        // это не повлияет на корректность работы кода.
        propsOptions
      })
    }
  }
  customElements.define(kebabCase(name), Component_)
  // @ts-expect-error проигнорировать ошибку типизации:
  // невозможно устранить ошибку типизации, но в данном случае
  // это не повлияет на корректность работы кода.
  return Component_
}

export default defineComponent
