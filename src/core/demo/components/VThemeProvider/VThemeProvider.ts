import { html } from 'lit-html'
import { defineComponent } from '../../../ui'

/**
 * Поставщик _UI_-темы.
 * @since 1.0.0
 * @version 1.0.0
 */
export default defineComponent({
  name: 'VThemeProvider',
  props: {
    dark: {
      default: () => false,
      reflector: (value) => value.toString(),
      type: Boolean
    },
    light: {
      default: () => false,
      reflector: (value) => value.toString(),
      type: Boolean
    }
  },
  shadowRootConfig: { mode: 'open' },
  setup() {
    return () => html`<slot></slot>`
  }
})
