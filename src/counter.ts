import { html } from 'lit-html'
import { ref } from './core/reactivity'
import { defineComponent } from './core/ui'

const VMessage = defineComponent({
  name: 'VMessage',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => html`<span style="font-weight: bold">${props.value}</span>`
  }
})
const VCounter = defineComponent({
  name: 'VCounter',
  setup() {
    const counter = ref(0)
    return () => {
      return html`
        <button type="button" @click=${() => counter.value++}>
          Count:
          <v-message .value=${counter.value.toString()}></v-message>
        </button>
      `
    }
  }
})

export { VCounter, VMessage }
