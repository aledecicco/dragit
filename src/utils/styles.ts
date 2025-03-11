import clsx, { type ClassValue } from 'clsx'
import type { HTMLProps } from 'react'

const cn = (...inputs: ClassValue[]): string => {
  return clsx(...inputs)
}

const propsWithCn = <T extends HTMLProps<HTMLElement>>(
  props: T,
  ...inputs: ClassValue[]
): T => {
  return {
    ...props,
    className: cn(...inputs, props.className),
  }
}

export { cn, propsWithCn }
