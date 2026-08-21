/**
 * Runs a function, logging how long it took in development builds.
 *
 * @param label - The label to log the duration under.
 * @param fn - The function to measure.
 */
const measure = <T>(label: string, fn: () => T): T => {
  if (!import.meta.env?.DEV) {
    return fn()
  }

  const start = performance.now()
  const res = fn()
  const duration = performance.now() - start

  console.debug(`[perf] ${label}: ${duration.toFixed(1)}ms`)

  return res
}

/**
 * Awaits a promise, logging how long it took to settle in development builds.
 *
 * @param label - The label to log the duration under.
 * @param fn - The function to measure.
 */
const measureAsync = async <T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> => {
  if (!import.meta.env?.DEV) {
    return fn()
  }

  const start = performance.now()

  try {
    return await fn()
  } finally {
    const duration = performance.now() - start
    console.debug(`[perf] ${label}: ${duration.toFixed(1)}ms`)
  }
}

export { measure, measureAsync }
