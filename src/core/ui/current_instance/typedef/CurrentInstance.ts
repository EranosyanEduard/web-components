export interface CurrentInstance extends HTMLElement {
  readonly $options: {
    readonly hooks: {
      readonly onBeforeMount: Set<VoidFunction>
      readonly onBeforeUpdate: Set<VoidFunction>
      readonly onMounted: Set<VoidFunction>
      readonly onUnmounted: Set<VoidFunction>
      readonly onUpdated: Set<VoidFunction>
    }
    readonly parent: CurrentInstance | null
    readonly provides: Map<symbol, unknown>
  }
}
