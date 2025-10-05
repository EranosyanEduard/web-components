import { html } from 'lit-html'
import { defineComponent, type PropType } from '../../../ui'

/** Список задач */
export default defineComponent({
  name: 'ToDoList',
  props: {
    items: {
      required: true,
      type: Array as PropType<
        ReadonlyArray<{
          complete: boolean
          text: string
        }>
      >
    }
  },
  emits: ['complete', 'delete'],
  setup(props, { emit }) {
    const onComplete = (index: number): void => {
      emit('complete', index)
    }
    const onDelete = (index: number): void => {
      emit('delete', index)
    }
    return () => html`
      <ul>
        ${props.items.map(
          (todo, index) => html`
            <li>
              ${todo.text}
              <div>
                <v-btn
                  .:text=${true}
                  .:disabled=${todo.complete}
                  @click=${() => {
                    onComplete(index)
                  }}
                >
                  +
                </v-btn>
                <v-btn
                  .:text=${true}
                  .:disabled=${todo.complete}
                  @click=${() => {
                    onDelete(index)
                  }}
                >
                  -
                </v-btn>
              </div>
            </li>
          `
        )}
      </ul>
    `
  }
})
