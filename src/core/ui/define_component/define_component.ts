import kebabCase from 'es-toolkit/compat/kebabCase'
import Component from './Component'
import type { ComponentOptions } from './typedef'

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
  customElements.define(kebabCase(name), Component_)
  return Component_
}

export default defineComponent
