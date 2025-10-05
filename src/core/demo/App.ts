import { html } from 'lit-html'
import { defineComponent } from '../ui'
import './components'
import './views'

export default defineComponent({
  name: 'MyApp',
  shadowRootConfig: { mode: 'open' },
  setup() {
    return () => html`<v-app>Hello, World!</v-app>`
  }
})
