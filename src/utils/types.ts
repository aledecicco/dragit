type ReactSetter<T> = React.Dispatch<React.SetStateAction<T>>

type LiteralUnion<LiteralType> = LiteralType | (string & Record<never, never>)

type Size = 'sm' | 'md' | 'lg'

export type { ReactSetter, LiteralUnion, Size }
