import Reactive from './Reactive.impl'

/**
 * Предикат, проверяющий является ли полученный аргумент реактивным объектом.
 * @param value произвольное значение
 * @returns `true`, если `value` - реактивный объект, иначе - `false`
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * isReactive(reactive({ counter: 0 })) // -> true
 * isReactive({ counter: 0 })           // -> false
 */
const isReactive = Reactive.isReactive
/**
 * Создать глубоко реактивный объект.
 * @param object произвольный объект
 * @returns реактивный объект
 * @since 1.0.0
 * @version 1.0.0
 * @example
 * <caption>Массив</caption>
 * const abc = reactive<string[]>([])
 * const stopEffect = watchEffect(() => {
 *   console.log(`abc includes ${abc.join(',')}`)
 * })
 * abc.push('a') // -> abc includes a
 * abc.push('b') // -> abc includes a,b
 * abc.push('c') // -> abc includes a,b,c
 * stopEffect()
 * abc.push('d')
 * abc.push('e')
 * abc.push('f')
 * @example
 * <caption>Объект</caption>
 * const counter = reactive({ value: 0 })
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
 */
const reactive = <T extends object>(
  object: T
): ReturnType<typeof Reactive.new<T>> => Reactive.new(object)
/**
 * Создать поверхностно реактивный объект.
 * @param object произвольный объект
 * @returns реактивный объект
 * @see {@link reactive}
 * @since 1.0.0
 * @version 1.0.0
 */
const shallowReactive = <T extends object>(
  object: T
): ReturnType<typeof Reactive.new<T>> => {
  return Reactive.new(object, { isShallow: true })
}

export { isReactive, reactive, shallowReactive }
