import { html } from 'lit-html'
import { ref } from './core/reactivity'
import {
  defineComponent,
  onBeforeMount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated
} from './core/ui'

const VMessage = defineComponent({
  name: 'VMessage',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  setup(props) {
    onBeforeMount(() => {
      console.log('VMessage created')
    })
    onMounted(() => {
      console.log('VMessage mounted')
    })
    onBeforeUpdate(() => {
      console.log('VMessage before update')
    })
    onUpdated(() => {
      console.log('VMessage updated')
    })
    onUnmounted(() => {
      console.log('VMessage destroyed')
    })
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
