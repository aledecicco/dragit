type ReactSetter<T> = React.Dispatch<React.SetStateAction<T>>
Object
type LiteralUnion<LiteralType extends string> =
  | LiteralType
  | (string & Record<never, never>)

type Size = 'sm' | 'md' | 'lg'

const idFn = <T>(v: T) => v

const mapFn = <T, R>(
  v: T | undefined | null,
  f: (v: T) => R,
): R | undefined => {
  if (v === undefined || v === null) {
    return undefined
  }

  return f(v)
}

type AnyObject = Record<never, never>

type PickPartial<T, K extends keyof T> = Partial<T> & Pick<T, K>

export type { ReactSetter, LiteralUnion, Size, AnyObject, PickPartial }
export { idFn, mapFn }
