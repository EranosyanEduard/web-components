import { html } from 'lit-html'
import { type Ref, ref } from './core/reactivity'
import {
  defineComponent,
  type InjectionKey,
  inject,
  onBeforeMount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  provide
} from './core/ui'

const counterInjectionKey: InjectionKey<Ref<number>> = Symbol('')
const VMessage = defineComponent({
  name: 'VMessage',
  setup() {
    const counter = inject(counterInjectionKey, () => {
      throw new Error('Не удалось осуществить инъекцию зависимости')
    })
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
    return () => html`<span style="font-weight: bold">${counter.value}</span>`
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
          <v-message></v-message>
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
    provide(counterInjectionKey, counter)
    return () => {
      return html`<v-counter .value=${counter.value} @input=${onInput}></v-counter>`
    }
  }
})

export { VCard, VCounter, VMessage }
