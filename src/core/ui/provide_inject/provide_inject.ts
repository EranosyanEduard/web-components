import _findLast from 'es-toolkit/compat/findLast'
import _isEmpty from 'es-toolkit/compat/isEmpty'
import _isNull from 'es-toolkit/compat/isNull'
import type { Getter } from '../../typedef'
import { type CurrentInstance, getCurrentInstance } from '../define_component'
import type { DependencyInjection, InjectionKey } from './typedef'

const providers = new Map<
  InjectionKey<unknown>,
  Set<CurrentInstance<Record<string, unknown>, string>>
>()
const di: DependencyInjection<unknown> = {
  inject: (key, fallbackValue) => {
    const currentInstance = getCurrentInstance()
    let providerForKey:
      | CurrentInstance<Record<string, unknown>, string>
      | undefined
    if (!_isNull(currentInstance) && providers.has(key)) {
      providerForKey = _findLast([...providers.get(key)!], (provider) => {
        return provider.contains(currentInstance)
      })
    }
    return providerForKey?.$options.provides.get(key) ?? fallbackValue()
  },
  provide: (key, value) => {
    const currentInstance = getCurrentInstance()
    if (_isNull(currentInstance)) {
      return
    }
    if (providers.has(key)) {
      providers.get(key)?.add(currentInstance)
    } else {
      providers.set(key, new Set([currentInstance]))
    }
    currentInstance.$options.hooks.onUnmounted.add(() => {
      const providersForKey = providers.get(key)
      providersForKey?.delete(currentInstance)
      if (_isEmpty(providersForKey)) {
        providers.delete(key)
      }
    })
    currentInstance.$options.provides.set(key, value)
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
