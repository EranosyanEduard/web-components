import { html } from 'lit-html'
import { defineComponent, type PropType } from '../../../ui'

/** Кнопка */
export default defineComponent({
  name: 'VBtn',
  props: {
    disabled: {
      default: () => false,
      type: Boolean
    },
    type: {
      default: () => 'button' as const,
      type: String as PropType<'button' | 'submit' | 'reset'>
    }
  },
  shadowRootConfig: { mode: 'open' },
  setup(props) {
    return () => html`
      <button
        ?disabled=${props.disabled}
        type=${props.type}
      >
        <slot></slot>
      </button>
    `
  }
})
