import findLast from 'es-toolkit/compat/findLast'
import isEmpty from 'es-toolkit/compat/isEmpty'
import isNull from 'es-toolkit/compat/isNull'
import type { Getter } from '../../typedef'
import { type CurrentInstance, getCurrentInstance } from '../define_component'
import type { DependencyInjection, InjectionKey } from './typedef'

const providers = new Map<
  InjectionKey<unknown>,
  Set<CurrentInstance<Record<string, unknown>, string>>
>()
const di: DependencyInjection<unknown> = {
  inject: (key, fallbackValue = () => null) => {
    const currentInstance = getCurrentInstance()
    let providerForKey:
      | CurrentInstance<Record<string, unknown>, string>
      | undefined
    if (!isNull(currentInstance) && providers.has(key)) {
      const providersForKey = [...providers.get(key)!]
      providerForKey = findLast(providersForKey, (provider) =>
        provider.contains(currentInstance)
      )
    }
    // @ts-expect-error проигнорировать ошибку типизации:
    // невозможно устранить ошибку типизации, возникшую из-за
    // перегрузки метода, но в данном случае это не повлияет
    // на корректность работы кода.
    return providerForKey?.$options.setup.provides.get(key) ?? fallbackValue()
  },
  provide: (key, value) => {
    const currentInstance = getCurrentInstance()
    if (isNull(currentInstance)) {
      return
    }
    const {
      $options: {
        setup: { hooks, provides }
      }
    } = currentInstance
    if (providers.has(key)) {
      providers.get(key)?.add(currentInstance)
    } else {
      providers.set(key, new Set([currentInstance]))
    }
    provides.set(key, value)
    hooks.onUnmounted.add(() => {
      const providersForKey = providers.get(key)
      providersForKey?.delete(currentInstance)
      if (isEmpty(providersForKey)) {
        providers.delete(key)
      }
    })
  }
}
function inject<T>(key: InjectionKey<T>): T | null
function inject<T>(key: InjectionKey<T>, value: Getter<T>): T
function inject<T>(key: InjectionKey<T>, value?: Getter<T>): T | null {
  // @ts-expect-error проигнорировать ошибку типизации:
  // невозможно устранить ошибку типизации, но в данном
  // случае это не повлияет на корректность работы кода.
  return di.inject(key, value)
}
function provide<T>(key: InjectionKey<T>, value: T): void {
  di.provide(key, value)
}

export { inject, provide }
