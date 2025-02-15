type ReactSetter<T> = React.Dispatch<React.SetStateAction<T>>

type LiteralUnion<LiteralType extends string> = LiteralType | (string & {})

type Size = 'sm' | 'md' | 'lg'

export type { ReactSetter, LiteralUnion, Size }
