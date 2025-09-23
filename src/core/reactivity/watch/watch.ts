import isEqual from 'es-toolkit/compat/isEqual'
import isFunction from 'es-toolkit/compat/isFunction'
import noop from 'es-toolkit/compat/noop'
import _once from 'es-toolkit/compat/once'
import { type ComputedTypedef, computed } from '../computed'
import { isReactive, Reactive, type ReactiveTypedef } from '../reactive'
import type { RefTypedef } from '../ref'
import { watchEffect } from '../watch_effect'
import type * as Typedef from './typedef'

function watch<T>(
  source:
    | ComputedTypedef.Accessor<T>['get']
    | ComputedTypedef.ComputedRef<T>
    | ComputedTypedef.WritableComputedRef<T>
    | RefTypedef.Ref<T>,
  handler: Typedef.WatchHandler<T>,
  options?: Partial<Typedef.WatchOptions>
): VoidFunction
function watch<T extends object>(
  source: ReactiveTypedef.Reactive<T>,
  handler: Typedef.WatchHandler<T>,
  options?: Partial<Typedef.WatchOptions>
): VoidFunction
function watch(
  source:
    | ComputedTypedef.Accessor<unknown>['get']
    | ComputedTypedef.ComputedRef<unknown>
    | ComputedTypedef.WritableComputedRef<unknown>
    | ReactiveTypedef.Reactive<object>
    | RefTypedef.Ref<unknown>,
  handler: Typedef.WatchHandler<unknown>,
  options?: Partial<Typedef.WatchOptions>
): VoidFunction {
  const { deep = false, immediate = false, once = false } = options ?? {}
  let canUseHandler = immediate
  let oldValue: unknown
  let source_: {
    readonly self: RefTypedef.RefLike<unknown>
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
      setup: _once(() => Reactive.trackAll(source))
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
