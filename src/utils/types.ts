type ReactSetter<T> = React.Dispatch<React.SetStateAction<T>>
Object
type LiteralUnion<LiteralType extends string> =
  | LiteralType
  | (string & Record<never, never>)

type Size = 'xs' | 'sm' | 'md' | 'lg'

/**
 * The identity function.
 */
const idFn = <T>(v: T) => v

/**
 * Functor map function. Applies a function to a value if defined, and returns `undefined` otherwise.
 *
 * @param v - The value to map.
 * @param f - The function to apply.
 */
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

/**
 * Makes the keys of a type `T` optional, except for the ones specified in `K`.
 */
type RequireOnly<T, K extends keyof T> = Partial<T> & Pick<T, K>

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type {
  ReactSetter,
  LiteralUnion,
  Size,
  AnyObject,
  RequireOnly,
  MakeOptional,
}
export { idFn, mapFn }
