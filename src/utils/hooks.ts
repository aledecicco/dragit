import { type Ref, useRef, useState } from 'react'
import { mergeRefs } from 'react-merge-refs'

const usePrevious = <T>(value: T): T | undefined => {
  const [current, setCurrent] = useState<T>(value)
  const [previous, setPrevious] = useState<T>()

  if (value !== current) {
    setPrevious(current)
    setCurrent(value)
  }

  return previous
}

const useCombinedRef = <T>(passedRef: Ref<T> | undefined): Ref<T> => {
  const innerRef = useRef<T>(null)
  return mergeRefs([innerRef, passedRef])
}

export { usePrevious, useCombinedRef }
