import { html } from 'lit-html'
import { defineComponent } from '../../../ui'
import { VThemeProvider } from '../VThemeProvider'

/**
 * Корневой элемент приложения.
 * @since 1.0.0
 * @version 1.0.0
 */
export default defineComponent({
  name: 'VApp',
  props: VThemeProvider.props,
  shadowRootConfig: { mode: 'open' },
  setup(props) {
    return () => html`
      <v-theme-provider .:dark=${props.dark} .:light=${props.light}>
        <slot></slot>
      </v-theme-provider>
    `
  }
})
