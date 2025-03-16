import { type DependencyList, useCallback, useReducer, useRef } from 'react'

import { MS_IN_SECOND } from './time'

interface BaseThrottleOptions {
  delay?: number
  trailingCall?: boolean
}

interface WithAccumulator<T> extends BaseThrottleOptions {
  withAccumulator: {
    initial: T
    update: (accumulator: T, args: T) => T
  }
}

interface WithoutAccumulator extends BaseThrottleOptions {
  withAccumulator?: never
}

type ThrottleOptions<T> = WithoutAccumulator | WithAccumulator<T>

function useThrottledCallback(
  callback: () => void,
  deps: DependencyList,
  options?: WithoutAccumulator,
): () => void

function useThrottledCallback<T>(
  callback: (args: T) => void,
  deps: DependencyList,
  options?: WithoutAccumulator,
): (args: T) => void

function useThrottledCallback<T>(
  callback: (acc: T) => void,
  deps: DependencyList,
  options: WithAccumulator<T>,
): (args: T) => void

function useThrottledCallback<T>(
  callback: (acc: T) => void,
  deps: DependencyList,
  options?: ThrottleOptions<T>,
): (args: T) => void {
  const accumulator = useRef(
    options?.withAccumulator
      ? { value: options?.withAccumulator.initial }
      : undefined,
  )
  const wait = useRef(false)
  const pending = useRef(false)
  const timeoutId = useRef<number>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: handle function reconstruction manually
  return useCallback((args: T) => {
    if (options?.withAccumulator && accumulator.current) {
      accumulator.current = {
        value: options?.withAccumulator.update(accumulator.current.value, args),
      }
    }

    if (wait.current) {
      pending.current = true
      return
    }

    wait.current = true
    pending.current = false

    const execute = () => {
      if (options?.withAccumulator) {
        if (accumulator.current) {
          callback(accumulator.current.value)
        }
      } else {
        callback(args)
      }

      if (options?.withAccumulator) {
        accumulator.current = { value: options?.withAccumulator.initial }
      }
    }

    const executeAndSchedule = () => {
      execute()

      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }

      timeoutId.current = setTimeout(
        () => {
          timeoutId.current = null
          wait.current = false

          if (pending.current) {
            pending.current = false

            if (options?.trailingCall) {
              execute()
            }
          }
        },
        options?.delay ?? MS_IN_SECOND / 60,
      )
    }

    executeAndSchedule()
  }, deps)
}

const useRerender = () => {
  const [rerenderTrigger, rerender] = useReducer((n) => (n + 1) % 60, 0)

  return { rerenderTrigger, rerender }
}

export { useThrottledCallback, useRerender }
export type {
  ThrottleOptions,
  WithAccumulator,
  WithoutAccumulator,
  BaseThrottleOptions,
}
