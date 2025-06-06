import { type ClassNameValue, twMerge } from 'tailwind-merge'

/**
 * Merges tailwind class names into a single string, removing duplicates and conflicts.
 *
 * @param inputs - An array of class names or objects containing class names.
 */
const cn = (...inputs: ClassNameValue[]): string => {
  return twMerge(...inputs)
}

/**
 * Takes a props object and merges its `className` with the provided class names,
 * removing duplicates and conflicts, and giving higher priority to the ones provided.
 *
 * @param props - The props to merge class names with.
 * @param inputs - The class name overrides to apply.
 *
 * @returns A new props object with the same type.
 */
const propsWithCn = <T extends { className?: string } | undefined>(
  props: T,
  ...inputs: ClassNameValue[]
): T => {
  return {
    ...props,
    className: cn(...inputs, props?.className),
  }
}

export { cn, propsWithCn }
