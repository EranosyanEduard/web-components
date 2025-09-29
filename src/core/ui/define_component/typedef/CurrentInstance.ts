import type { ComponentOptions } from './Component'

export interface CurrentInstance<
  Props extends Record<string, unknown>,
  Emits extends string
> extends HTMLElement {
  readonly $options: {
    readonly componentOptions: ComponentOptions<Props, Emits>
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
