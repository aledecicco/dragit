export const range: {
  /**
   * @returns a range of `size` numbers starting from 0.
   */
  (size: number): number[]
  /**
   * @returns the range of numbers contained in [`from`, `to`)
   */
  (from: number, to: number): number[]
} = (from: number, to?: number): number[] => {
  const size = to === undefined ? from : to - from + 1
  const array = [...Array(size).keys()]

  return to === undefined ? array : array.map((elem) => elem + from)
}

export const mapOr = <T, R, D>(or: D, arr: T[], fn: (v: T) => R): R[] | D => {
  if (arr.length === 0) {
    return or
  }

  return arr.map(fn)
}
