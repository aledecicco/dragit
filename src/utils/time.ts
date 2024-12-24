import { useCallback, useRef } from 'react'

const useThrottle = (callback: () => void, delay: number) => {
  const wait = useRef(false)

  return useCallback(() => {
    if (wait.current) {
      return
    }

    callback()

    wait.current = true
    setTimeout(() => {
      wait.current = false
    }, delay)
  }, [callback, delay])
}

export { useThrottle }
