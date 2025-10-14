import Computed from './Computed.impl'

/**
 * Предикат, проверяющий является ли полученный аргумент вычисляемым значением.
 * @param value произвольное значение
 * @returns `true`, если `value` - вычисляемое значение, иначе - `false`
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * isComputed(computed(() => 0))               // -> true
 * isComputed(reactive({ value: 0 }))          // -> false
 * isComputed(ref(0))                          // -> false
 * isComputed(() => 0)                         // -> false
 * isComputed({ get: () => 0, set: () => {} }) // -> false
 * isComputed({ value: 0 })                    // -> false
 */
const isComputed = Computed.isComputed
/**
 * Создать вычисляемое значение.
 * @param value функция или свойство доступа
 * @returns вычисляемое значение
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * <caption>Функциональное вычисляемое значение</caption>
 * const counter = ref(0)
 * const computedCounter = computed(() => `count is ${counter.value}`)
 * watchEffect(() => {
 *   console.log(computedCounter)
 * })
 * counter.value++ // -> count is 1
 * counter.value++ // -> count is 2
 * counter.value++ // -> count is 3
 * counter.value = 3
 * counter.value = 3
 * counter.value = 3
 * @example
 * <caption>Объектное вычисляемое значение</caption>
 * const counter = ref(0)
 * const computedCounter = computed<number>({
 *   get: () => counter.value,
 *   set: (value) => (counter.value = value)
 * })
 * watchEffect(() => {
 *   console.log(`count is ${computedCounter}`)
 * })
 * counter.value++ // -> count is 1
 * counter.value++ // -> count is 2
 * counter.value++ // -> count is 3
 * counter.value = 3
 * counter.value = 3
 * counter.value = 3
 */
const computed = Computed.new

export { computed, isComputed }
