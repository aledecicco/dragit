/**
 * Constrains a value between a minimum and maximum value.
 *
 * @param value - The value to clamp.
 * @param min - The minimum value.
 * @param max - The maximum value.
 */
const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value))
}

export { clamp }
