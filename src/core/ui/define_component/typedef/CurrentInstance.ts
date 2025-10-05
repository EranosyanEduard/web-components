import type { ComponentOptions } from './Component'

/**
 * Текущий экземпляр веб-компонента.
 * @since 1.0.0
 * @version 1.0.0
 */
export interface CurrentInstance<
  Props extends Record<string, unknown>,
  Emits extends string
> extends HTMLElement {
  readonly $options: {
    readonly componentOptions: ComponentOptions<Props, Emits>
    readonly setup: {
      readonly hooks: {
        readonly onBeforeMount: Set<VoidFunction>
        readonly onBeforeUpdate: Set<VoidFunction>
        readonly onMounted: Set<VoidFunction>
        readonly onUnmounted: Set<VoidFunction>
        readonly onUpdated: Set<VoidFunction>
      }
      readonly props: Props
      readonly provides: Map<symbol, unknown>
    }
  }
}
