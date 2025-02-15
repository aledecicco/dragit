type ReactSetter<T> = React.Dispatch<React.SetStateAction<T>>

type LiteralUnion<LiteralType extends string> =
  | LiteralType
  | (string & Record<never, never>)

type Size = 'sm' | 'md' | 'lg'

const idFn = <T>(v: T) => v

export type { ReactSetter, LiteralUnion, Size }
export { idFn }
