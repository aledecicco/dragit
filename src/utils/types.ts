export type ReactSetter<T> = React.Dispatch<React.SetStateAction<T>>

export type Size = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Functor map function. Applies a function to a value if defined, and returns `undefined` otherwise.
 *
 * @param v - The value to map.
 * @param f - The function to apply.
 */
export const mapFn = <T, R>(
  v: T | undefined | null,
  f: (v: T) => R,
): R | undefined => {
  if (v === undefined || v === null) {
    return undefined
  }

  return f(v)
}

export type AnyObject = Record<never, never>

/**
 * Makes the keys of a type `T` optional, except for the ones specified in `K`.
 */
export type RequireOnly<T, K extends keyof T> = Partial<T> & Pick<T, K>

export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>
