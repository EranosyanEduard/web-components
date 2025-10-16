import type { Dependency } from '../../dependency'

export interface ReactiveConfig {
  readonly externalDependencies: readonly Dependency[]
}
