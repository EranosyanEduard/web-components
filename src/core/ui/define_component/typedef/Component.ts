import type { html } from 'lit-html'
import type { Getter } from '../../../typedef'
import type { PropsOptions } from './Props'

/**
 * Конфигурация веб-компонента.
 * @since 1.0.0
 * @version 1.0.0
 */
export interface ComponentOptions<
  Props extends Record<string, unknown>,
  Emits extends string
> {
  readonly name: string
  readonly emits?: readonly Emits[]
  readonly props?: PropsOptions<Props>
  readonly setup: (
    props: Readonly<Props>,
    options: SetupOptions<Emits>
  ) => Getter<ReturnType<typeof html>>
  readonly shadowRootConfig?: ShadowRootInit
}
export interface SetupOptions<EventType extends string> {
  readonly emit: <T = undefined>(eventType: EventType, detail?: T) => void
}
