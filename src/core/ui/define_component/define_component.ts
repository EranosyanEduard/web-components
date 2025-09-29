import _kebabCase from 'es-toolkit/compat/kebabCase'
import Component from './Component'
import type { ComponentOptions } from './typedef'

/**
 * Создать веб-компонент.
 * @returns конструктор веб-компонента.
 * @since 1.0.0
 * @version 1.0.0
 */
function defineComponent<
  Props extends Record<string, unknown> = Record<string, unknown>,
  Emits extends string = string
>(options: ComponentOptions<Props, Emits>): CustomElementConstructor {
  const { name } = options
  const Component_ = class extends Component<Props, Emits> {
    constructor() {
      super(options)
    }
  }
  customElements.define(_kebabCase(name), Component_)
  return Component_
}

export default defineComponent
