import type { html } from 'lit-html'
import type { Getter } from '../../../typedef'
import type { PropsOptions } from './Props'

export interface ComponentOptions<Props extends Record<string, unknown>> {
  readonly name: string
  readonly props?: PropsOptions<Props>
  readonly setup: (props: Readonly<Props>) => Getter<ReturnType<typeof html>>
  readonly shadowRootConfig?: ShadowRootInit
}
