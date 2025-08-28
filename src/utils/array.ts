export const range: {
  /**
   * Creates a range of numbers.
   *
   * @param size - The number of elements in the range.
   *
   * @returns A range of `size` numbers starting from 0.
   */
  (size: number): number[]
  /**
   * Creates a range of numbers between two values.
   *
   * @param from - The first number of the range (inclusive).
   * @param to - The last number of the range (exclusive).
   *
   * @returns The range of numbers contained in [`from`, `to`)
   */
  (from: number, to: number): number[]
} = (from: number, to?: number): number[] => {
  const size = to === undefined ? from : to - from + 1
  const array = [...Array(size).keys()]

  return to === undefined ? array : array.map((elem) => elem + from)
}

/**
 * Maps an array with a function, returning a default value if the array is empty.
 *
 * @param or - The default value to return if the array is empty.
 * @param arr - The array to map.
 * @param fn - The function to apply to each element of the array.
 */
export const mapOr = <T, R, D>(or: D, arr: T[], fn: (v: T) => R): R[] | D => {
  if (arr.length === 0) {
    return or
  }

  return arr.map(fn)
}

/**
 * Splits an array into chunks using the given condition.
 *
 * @param arr - The array to split.
 * @param isDelimiter - The condition that determines that an item is a delimiter.
 */
export const splitWhen = <T>(
  arr: T[],
  isDelimiter: (item: T) => boolean,
): T[][] => {
  const res: T[][] = []

  let chunk: T[] = []
  for (const item of arr) {
    if (isDelimiter(item)) {
      res.push(chunk)
      chunk = []
    } else {
      chunk.push(item)
    }
  }

  if (chunk.length > 0) {
    res.push(chunk)
  }

  return res
}

/**
 * Splits an array into chunks using the given delimiter.
 *
 * @param arr - The array to split.
 * @param delimiter - The delimiter to split the chunks at.
 */
export const splitBy = <T>(arr: T[], delimiter: T): T[][] => {
  return splitWhen(arr, (item) => item === delimiter)
}
