import { html } from 'lit-html'
import { defineComponent } from '../../../ui'

/** Поле ввода */
export default defineComponent({
  name: 'VInput',
  props: {
    disabled: {
      default: () => false,
      type: Boolean
    },
    type: {
      default: () => 'text',
      type: String
    },
    value: {
      required: true,
      type: String
    }
  },
  emits: ['input'],
  shadowRootConfig: { mode: 'open' },
  setup(props, { emit }) {
    const oninput = (event: Event): void => {
      event.stopPropagation()
      emit('input', (event.target as HTMLInputElement).value)
    }
    return () => html`
      <input
        ?disabled=${props.disabled}
        type=${props.type}
        .value=${props.value}
        @input=${oninput}
      />
    `
  }
})
