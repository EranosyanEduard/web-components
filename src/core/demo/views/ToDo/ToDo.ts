import _isEmpty from 'es-toolkit/compat/isEmpty'
import { html } from 'lit-html'
import { computed, ref } from '../../../reactivity'
import { defineComponent } from '../../../ui'
import './ToDoList'

/** Представление "Список задач" */
export default defineComponent({
  name: 'ToDo',
  setup() {
    const todoInput = ref('')
    const todoList = ref<Array<{ complete: boolean; text: string }>>([
      { complete: false, text: 'foo' },
      { complete: false, text: 'bar' },
      { complete: false, text: 'baz' }
    ])
    const disabledTodoBtn = computed<boolean>(() => _isEmpty(todoInput.value))
    const oninputTodo = (event: CustomEvent<string>): void => {
      todoInput.value = event.detail
    }
    const todoApi = {
      create: async (): Promise<void> => {
        todoList.value = [
          ...todoList.value,
          {
            complete: false,
            text: todoInput.value
          }
        ]
        todoInput.value = ''
      },
      delete: async (event: CustomEvent<number>): Promise<void> => {
        todoList.value = todoList.value.filter((_, i) => event.detail !== i)
      },
      update: async (event: CustomEvent<number>): Promise<void> => {
        todoList.value = todoList.value.filter((_, i) => event.detail !== i)
      }
    } as const
    return () => html`
      <div>
        <v-input
          .value=${todoInput.value}
          @input=${oninputTodo}
        ></v-input>
        <v-btn
          .disabled=${disabledTodoBtn.value}
          @click=${todoApi.create}
        >
          Добавить
        </v-btn>
      </div>
      <to-do-list
        .items=${todoList.value}
        @delete=${todoApi.delete}
        @complete=${todoApi.update}
      ></todo-list>
    `
  }
})
