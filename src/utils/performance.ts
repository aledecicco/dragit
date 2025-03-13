import { useCallback, useReducer, useRef } from 'react'

interface BaseThrottleOptions {
  delay: number
  waitForFrame?: boolean
  trailingCall?: boolean
}

type ThrottleOptions<T, A> = BaseThrottleOptions &
  (
    | {
        callback?: never
        withAccumulator: {
          initial: T
          update: (accumulator: T, args: A) => T
          callback: (accumulator: T) => void
        }
      }
    | {
        callback: () => void
        withAccumulator?: never
      }
  )

/**
 * Returns a throttled version of the given callback.
 * Can optionally keep track of the debounced calls and accumulate them.
 *
 * @param options Configuration options.
 * @param options.delay The throttle delay in milliseconds.
 * @param options.waitForFrame Whether to wait for an animation frame before executing.
 * @param options.trailingCall Whether to perform trailing callbacks.
 * @param options.callback The function to throttle, if no accumulation is needed
 * @param options.withAccumulator Configuration that enables accumulating calls.
 * @param options.withAccumulator.initial Initial value for the accumulator.
 * @param options.withAccumulator.update Function that updates the accumulator with new arguments.
 * @param options.withAccumulator.callback The function to throttle, that gets passed the accumulated value.
 */
const useThrottledCallback = <T = void, A = T>(
  options: ThrottleOptions<T, A>,
) => {
  const accumulator = useRef(
    options.withAccumulator
      ? { value: options.withAccumulator.initial }
      : undefined,
  )
  const wait = useRef(false)
  const pending = useRef(false)
  const timeoutId = useRef<number>(null)

  return useCallback(
    (args: A) => {
      if (options.withAccumulator && accumulator.current) {
        accumulator.current = {
          value: options.withAccumulator.update(
            accumulator.current.value,
            args,
          ),
        }
      }

      if (wait.current) {
        pending.current = true
        return
      }

      wait.current = true
      pending.current = false

      const execute = () => {
        if (options.withAccumulator && accumulator.current) {
          options.withAccumulator.callback(accumulator.current.value)
        } else {
          options.callback?.()
        }

        if (options.withAccumulator) {
          accumulator.current = { value: options.withAccumulator.initial }
        }
      }

      const executeAndSchedule = () => {
        execute()

        if (timeoutId.current) {
          clearTimeout(timeoutId.current)
        }

        timeoutId.current = setTimeout(() => {
          timeoutId.current = null

          if (pending.current) {
            // Trailing call
            pending.current = false

            if (options.trailingCall) {
              execute()
            }
          }

          wait.current = false
        }, options.delay)
      }

      if (options.waitForFrame) {
        requestAnimationFrame(() => {
          executeAndSchedule()
        })
      } else {
        executeAndSchedule()
      }
    },
    [options],
  )
}

const useRerender = () => {
  const [refresherDep, rerender] = useReducer((n) => (n + 1) % 60, 0)

  return { refresherDep, rerender }
}

export { useThrottledCallback, useRerender }
