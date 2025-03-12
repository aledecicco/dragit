import { type ClassNameValue, twMerge } from 'tailwind-merge'

const cn = (...inputs: ClassNameValue[]): string => {
  return twMerge(...inputs)
}

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
