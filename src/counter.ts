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
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  emits: ['input'],
  setup(props, { emit }) {
    return () => {
      return html`
        <button type="button" @click=${() => emit('input', props.value + 1)}>
          Count:
          <v-message .value=${props.value.toString()}></v-message>
        </button>
      `
    }
  }
})
const VCard = defineComponent({
  name: 'VCard',
  setup() {
    const counter = ref(0)
    const onInput = (evt: CustomEvent<number>) => {
      counter.value = evt.detail
    }
    return () => {
      return html`<v-counter .value=${counter.value} @input=${onInput}></v-counter>`
    }
  }
})

export { VCard, VCounter, VMessage }
