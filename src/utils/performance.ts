import { useCallback, useReducer, useRef } from 'react'

/**
 * Returns a throttled callback that can also wait for animation frames.
 */
const useThrottle = (
  callback: () => void,
  delay: number,
  waitForFrame?: boolean,
) => {
  const wait = useRef(false)

  return useCallback(() => {
    if (wait.current) {
      return
    }

    wait.current = true

    if (waitForFrame) {
      requestAnimationFrame(() => {
        callback()
        setTimeout(() => {
          wait.current = false
        }, delay)
      })
    } else {
      callback()
      setTimeout(() => {
        wait.current = false
      }, delay)
    }
  }, [callback, delay, waitForFrame])
}

/**
 * Returns a throttled callback that keeps track of and accumulates the values it's called with.
 * When it's the given callback's turn to run, it's called with the accumulated value.
 */
const useThrottleWithAccumulator = <T, A = T>(
  callback: (accumulator: T) => void,
  delay: number,
  initialAccumulator: T,
  updateAccumulator: (accumulator: T, args: A) => T,
  waitForFrame?: boolean,
): ((args: A) => void) => {
  const accumulator = useRef(initialAccumulator)
  const wait = useRef(false)

  return useCallback(
    (args: A) => {
      accumulator.current = updateAccumulator(accumulator.current, args)

      if (wait.current) {
        return
      }

      wait.current = true
      accumulator.current = initialAccumulator

      if (waitForFrame) {
        requestAnimationFrame(() => {
          callback(accumulator.current)
          setTimeout(() => {
            wait.current = false
          }, delay)
        })
      } else {
        callback(accumulator.current)
        setTimeout(() => {
          wait.current = false
        }, delay)
      }
    },
    [callback, delay, initialAccumulator, updateAccumulator, waitForFrame],
  )
}

const useRerender = () => {
  const [refresherDep, rerender] = useReducer((n) => (n + 1) % 60, 0)

  return { refresherDep, rerender }
}

export { useThrottle, useThrottleWithAccumulator, useRerender }
