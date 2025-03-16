import {
  type DependencyList,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from 'react'

import {
  type VirtualizerOptions,
  useVirtualizer,
} from '@tanstack/react-virtual'
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

type VirtualListOptions<T extends HTMLElement> = Omit<
  Parameters<typeof useVirtualizer<T, Element>>['0'],
  'getScrollElement'
>

const useVirtualList = <T extends HTMLElement>(
  options: VirtualListOptions<T>,
) => {
  const scrollContainerRef = useRef<T>(null)
  const virtualizer = useVirtualizer({
    ...options,
    getScrollElement: () => scrollContainerRef.current,
  })

  return {
    scrollContainerRef,
    virtualizer,
    isScrolled:
      virtualizer.scrollOffset !== null && virtualizer.scrollOffset > 0,
    hasScrollLeft:
      virtualizer.scrollOffset !== null &&
      scrollContainerRef.current !== null &&
      virtualizer.scrollOffset <
        virtualizer.getTotalSize() - scrollContainerRef.current?.clientHeight,
  }
}

export { useThrottledCallback, useRerender, useVirtualList }
export type {
  ThrottleOptions,
  WithAccumulator,
  WithoutAccumulator,
  BaseThrottleOptions,
  VirtualListOptions,
}
