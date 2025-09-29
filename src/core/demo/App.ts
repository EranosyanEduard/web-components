import { html } from 'lit-html'
import { defineComponent } from '../ui'
import './components'
import './views'

export default defineComponent({
  name: 'VApp',
  setup() {
    return () => html`<to-do></to-do>`
  }
})
