import Ref from './Ref.impl'

/**
 * Предикат, проверяющий является ли полученный аргумент реактивным значением.
 * @param value произвольное значение
 * @returns `true`, если `value` - реактивное значение, иначе - `false`
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * isRef(ref(0))                 // -> true
 * isRef(reactive({ value: 0 })) // -> false
 * isRef({ value: 0 })           // -> false
 */
const isRef = Ref.isRef
/**
 * Создать глубоко реактивное значение.
 * @param value произвольное значение
 * @returns реактивное значение
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * <caption>Примитивное значение</caption>
 * const counter = ref(0)
 * const stopEffect = watchEffect(() => {
 *   console.log(`count is ${counter.value}`)
 * })
 * counter.value++ // -> count is 1
 * counter.value++ // -> count is 2
 * counter.value++ // -> count is 3
 * stopEffect()
 * counter.value++
 * counter.value++
 * counter.value++
 * @example
 * <caption>Объект</caption>
 * const counters = ref({ counterA: 0 })
 * const stopEffect = watchEffect(() => {
 *   console.log(`count is ${counters.value.counterA}`)
 * })
 * counter.value.counterA++ // -> count is 1
 * counter.value.counterA++ // -> count is 2
 * counter.value.counterA++ // -> count is 3
 * stopEffect()
 * counter.value.counterA++
 * counter.value.counterA++
 * counter.value.counterA++
 */
const ref = <T>(value: T): ReturnType<typeof Ref.new<T>> => Ref.new(value)
/**
 * Создать поверхностно реактивное значение.
 * @param value произвольное значение
 * @returns реактивное значение
 * @see {@link ref}
 * @since 1.0.0
 * @version 1.0.0
 */
const shallowRef = <T>(value: T): ReturnType<typeof Ref.new<T>> => {
  return Ref.new(value, { isShallow: true })
}

export { isRef, ref, shallowRef }
