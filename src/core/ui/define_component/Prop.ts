import { assert } from 'es-toolkit'
import castArray from 'es-toolkit/compat/castArray'
import isArray from 'es-toolkit/compat/isArray'
import isBoolean from 'es-toolkit/compat/isBoolean'
import isEmpty from 'es-toolkit/compat/isEmpty'
import isFunction from 'es-toolkit/compat/isFunction'
import isNumber from 'es-toolkit/compat/isNumber'
import isObject from 'es-toolkit/compat/isObject'
import isString from 'es-toolkit/compat/isString'
import type { Predicate } from '../../typedef'
import type { AllPropOptions, PropConstructor, PropOptions } from './typedef'
import { PropTypeError } from './utils'

class Prop<T> {
  static #defineValidator<T>(
    name: string,
    propOptions: Pick<Required<PropOptions<T>>, 'type' | 'validator'>
  ): Predicate<T> {
    const { type, validator } = propOptions
    const types = castArray(type)
    const validators = types.flatMap(
      (propType) => Prop.#DEFAULT_PROP_VALIDATORS.get(propType) ?? []
    )
    return (propValue) => {
      const isValidPropType =
        isEmpty(validators) ||
        validators.some((validate) => validate(propValue))
      if (!isValidPropType || !validator(propValue)) {
        throw new PropTypeError({
          name,
          types,
          value: propValue
        })
      }
      return true
    }
  }

  static readonly #DEFAULT_PROP_VALIDATORS: ReadonlyMap<
    PropConstructor<unknown>,
    Predicate<unknown>
  > = new Map<PropConstructor<unknown>, Predicate<unknown>>([
    [Array, isArray],
    [Boolean, isBoolean],
    [Function, isFunction],
    [Number, isNumber],
    [Object, isObject],
    [String, isString]
  ])

  readonly options: Required<AllPropOptions<T>>

  constructor(name: string, options: PropOptions<T>) {
    const {
      type,
      default: default_ = () => {
        assert(false, `Значение props-а ${name} по умолчанию не определено`)
      },
      required = false,
      validator = () => true
    } = options as AllPropOptions<T>
    const defaultValue = required
      ? () => {
          assert(false, `Значение обязательного props-а ${name} не определено`)
        }
      : default_
    this.options = {
      default: defaultValue,
      type,
      required,
      validator: Prop.#defineValidator(name, {
        type,
        validator
      })
    }
  }
}

export default Prop
