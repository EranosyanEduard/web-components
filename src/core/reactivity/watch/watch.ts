import isEqual from 'es-toolkit/compat/isEqual'
import isFunction from 'es-toolkit/compat/isFunction'
import noop from 'es-toolkit/compat/noop'
import _once from 'es-toolkit/compat/once'
import {
  type Accessor,
  type ComputedRef,
  computed,
  type WritableComputedRef
} from '../computed'
import { isReactive, type Reactive, reactiveTrackAll } from '../reactive'
import type { Ref, RefLike } from '../ref'
import { watchEffect } from '../watch_effect'
import type { WatchHandler, WatchOptions } from './typedef'

function watch<T>(
  source: Accessor<T>['get'] | ComputedRef<T> | WritableComputedRef<T> | Ref<T>,
  handler: WatchHandler<T>,
  options?: Partial<WatchOptions>
): VoidFunction
function watch<T extends object>(
  source: Reactive<T>,
  handler: WatchHandler<T>,
  options?: Partial<WatchOptions>
): VoidFunction
function watch(
  source:
    | Accessor<unknown>['get']
    | ComputedRef<unknown>
    | WritableComputedRef<unknown>
    | Reactive<object>
    | Ref<unknown>,
  handler: WatchHandler<unknown>,
  options?: Partial<WatchOptions>
): VoidFunction {
  const { deep = false, immediate = false, once = false } = options ?? {}
  let canUseHandler = immediate
  let oldValue: unknown
  let source_: {
    readonly self: RefLike<unknown>
    readonly setup: VoidFunction
  }
  if (isFunction(source)) {
    source_ = {
      self: computed(source),
      setup: noop
    }
  } else if (isReactive(source)) {
    source_ = {
      self: { value: source },
      setup: _once(() => reactiveTrackAll(source))
    }
  } else {
    source_ = {
      self: source,
      setup: noop
    }
  }
  const stop = watchEffect(() => {
    const oldValueCopy = oldValue
    oldValue = source_.self.value
    source_.setup()
    if (!canUseHandler) {
      canUseHandler = true
      return
    }
    if (deep && isEqual(oldValue, oldValueCopy)) return
    // при первом вызове oldValueCopy равен undefined, если
    // immediate равен true.
    handler(oldValue, oldValueCopy)
    if (once && !immediate) stop()
  })
  if (once && immediate) {
    stop()
    return noop
  }
  return stop
}

export default watch
