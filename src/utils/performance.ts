import { useVirtualizer } from '@tanstack/react-virtual'
import { type DependencyList, useCallback, useReducer, useRef } from 'react'

import { MS_IN_SECOND } from './time'

interface DebounceOptions {
  /**
   * The delay in milliseconds before the callback is executed.
   * Defaults to 1/10th of a second.
   */
  delay?: number
}

/**
 * Creates a debounced version of the given callback.
 *
 * @param callback - The function to debounce.
 * @param deps - The dependencies that cause the callback to be created again.
 * @param options - Options for the debounce behavior.
 */
const useDebouncedCallback = <T>(
  callback: (args: T) => void,
  deps: DependencyList,
  options?: DebounceOptions,
): ((args: T) => void) => {
  const timeoutId = useRef<number>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: handle function reconstruction manually
  return useCallback((args: T) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }

    timeoutId.current = setTimeout(
      () => {
        timeoutId.current = null
        callback(args)
      },
      options?.delay ?? MS_IN_SECOND / 10,
    )
  }, deps)
}

interface ThrottleOptions {
  /**
   * The delay in milliseconds before the next call can be made.
   * Defaults to 1/60th of a second (for 60 hz).
   */
  delay?: number

  /**
   * Whether to trigger the callback at the end of the wait period if a call was throttled in the meantime.
   * Defaults to false.
   */
  trailingCall?: boolean
}

/**
 * Creates a throttled version of the given callback.
 *
 * @param callback - The function to throttle.
 * @param deps - The dependencies that cause the callback to be rebuilt.
 * @param options - Options for the throttling behavior.
 */
const useThrottledCallback = <T>(
  callback: (args: T) => void,
  deps: DependencyList,
  options?: ThrottleOptions,
): ((args: T) => void) => {
  /**
   * Whether calls must be stopped.
   */
  const wait = useRef(false)
  /**
   * Whether a call was made during the wait period.
   */
  const pending = useRef(false)

  const timeoutId = useRef<number>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: handle function reconstruction manually
  return useCallback((args: T) => {
    if (wait.current) {
      pending.current = true
      return
    }

    wait.current = true
    pending.current = false

    const executeAndSchedule = () => {
      callback(args)

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
              callback(args)
            }
          }
        },
        options?.delay ?? MS_IN_SECOND / 60,
      )
    }

    executeAndSchedule()
  }, deps)
}

/**
 * Hook that provides a way to trigger a rerender.
 *
 * @returns An object containing:
 * - `rerenderTrigger`: A variable that can be used as a dependency to trigger a rerender.
 * - `rerender`: A function that can be called to manually trigger a rerender.
 */
const useRerender = () => {
  const [rerenderTrigger, rerender] = useReducer(
    (n) => (n + 1) % Number.MAX_SAFE_INTEGER,
    0,
  )

  return { rerenderTrigger, rerender }
}

type VirtualListOptions<T extends HTMLElement> = Omit<
  Parameters<typeof useVirtualizer<T, Element>>['0'],
  'getScrollElement'
>

/**
 * Hook that puts together the state used for a virtual list and its display.
 *
 * @param options - Options for the virtualizer.
 *
 * @returns An object containing:
 * - `scrollContainerRef`: A ref to the element that can be scrolled.
 * - `virtualizer`: The virtualizer instance.
 * - `isScrolled`: Whether the list has been scrolled down.
 * - `hasScrollLeft`: Whether the list can be scrolled down.
 */
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

export {
  useDebouncedCallback,
  useThrottledCallback,
  useRerender,
  useVirtualList,
}
export type { DebounceOptions, ThrottleOptions, VirtualListOptions }
