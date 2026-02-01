import { useReducer, useRef } from 'react'
import { useVirtualizer as useTanstackVirtualizer } from '@tanstack/react-virtual'

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
 * @param options - Options for the debounce behavior.
 */
function useDebouncedCallback(
  callback: () => void,
  options?: DebounceOptions,
): () => void

function useDebouncedCallback<T>(
  callback: (args: T) => void,
  options?: DebounceOptions,
): (args: T) => void {
  const timeoutId = useRef<number>(null)

  return (args: T) => {
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
  }
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
 * @param callback - The function to debounce.
 * @param options - Options for the throttling behavior.
 */
function useThrottledCallback(
  callback: () => void,
  options?: ThrottleOptions,
): () => void

function useThrottledCallback<T>(
  callback: (args: T) => void,
  options?: ThrottleOptions,
): (args: T) => void {
  /**
   * Whether calls must be stopped.
   */
  const wait = useRef(false)
  /**
   * Whether a call was made during the wait period.
   */
  const pending = useRef(false)

  const timeoutId = useRef<number>(null)

  return (args: T) => {
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
  }
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

type VirtualizerOptions<T extends Element, I extends Element> = Parameters<
  typeof useTanstackVirtualizer<T, I>
>[0]

/**
 * Hook that handles virtualization of a list of items.
 *
 * @param options - The options for the virtualizer.
 *
 * @returns An object containing:
 * - `scrollOffset`: The current scroll offset.
 * - `scrollElement`: The scrollable element.
 * - `totalSize`: The total size of the virtualized content.
 * - `virtualItems`: The list of virtual items.
 */
const useVirtualizer = <T extends Element, I extends Element>(
  options: VirtualizerOptions<T, I>,
) => {
  'use no memo'

  // TODO: https://github.com/TanStack/virtual/issues/736
  // TODO: https://github.com/TanStack/virtual/issues/743

  const { scrollOffset, scrollElement, getTotalSize, getVirtualItems } =
    useTanstackVirtualizer(options)

  return {
    scrollOffset,
    scrollElement,
    totalSize: getTotalSize(),
    virtualItems: getVirtualItems(),
  }
}

export {
  useDebouncedCallback,
  useThrottledCallback,
  useRerender,
  useVirtualizer,
}
export type { DebounceOptions, ThrottleOptions }
