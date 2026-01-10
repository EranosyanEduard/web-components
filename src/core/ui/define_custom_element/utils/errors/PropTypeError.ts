import type { PropConstructor } from '../../typedef'

class PropTypeError extends Error {
  constructor(args: {
    readonly name: string
    readonly types: ReadonlyArray<PropConstructor<unknown>>
    readonly value: unknown
  }) {
    const { name, types, value } = args
    super(`Недопустимое значение props-а "${name}"`, {
      cause: {
        types,
        received: {
          type: typeof value,
          value
        }
      } as const
    })
    this.name = 'PropTypeError'
  }
}

export default PropTypeError
