import isNull from 'es-toolkit/compat/isNull'
import type { Getter } from '../../typedef'
import { getCurrentInstance } from '../current_instance'
import { getParentInstance } from '../parent_instance'
import type { DependencyInjection, InjectionKey } from './typedef'

const di: DependencyInjection<unknown> = {
  inject: (key, fallbackValue) => {
    let parentInstance = getParentInstance()
    while (!isNull(parentInstance)) {
      if (parentInstance.$options.provides.has(key)) {
        return parentInstance.$options.provides.get(key)
      }
      parentInstance = parentInstance.$options.parent
    }
    return fallbackValue()
  },
  provide: (key, value) => {
    getCurrentInstance()?.$options.provides.set(key, value)
  }
}
const inject = <T>(key: InjectionKey<T>, value: Getter<T>): T => {
  // @ts-expect-error проигнорировать ошибку типизации:
  // невозможно устранить ошибку типизации, но в данном
  // случае это не повлияет на корректность работы кода.
  return di.inject(key, value)
}
const provide = <T>(key: InjectionKey<T>, value: T): void => {
  di.provide(key, value)
}

export { inject, provide }
