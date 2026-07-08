import { useEffect, useMemo, useRef, useState } from 'react'

import { useSettings } from '@/state/storage'

export const MS_IN_SECOND = 1000
export const MS_IN_MINUTE = 60 * MS_IN_SECOND
export const MS_IN_HOUR = 60 * MS_IN_MINUTE
export const MS_IN_DAY = 24 * MS_IN_HOUR
export const MS_IN_WEEK = 7 * MS_IN_DAY
export const MS_IN_MONTH = 30 * MS_IN_DAY
export const MS_IN_YEAR = 365 * MS_IN_DAY

/**
 * A value that auto-updates with the given frequency.
 *
 * @param factory - A function that returns the value to memoize.
 * @param interval - The refresh interval in milliseconds.
 */
export const useTimedValue = <T>(factory: () => T, interval: number) => {
  const isSet = useRef(false)
  const [value, setValue] = useState(() => factory())

  useEffect(() => {
    if (!isSet.current) {
      const id = setInterval(() => {
        setValue(factory())
      }, interval)

      return () => clearInterval(id)
    }
  }, [factory, interval])

  return value
}

const dateDiffFormatter = new Intl.RelativeTimeFormat('en', { style: 'long' })

/**
 * Builds a human-readable string with the time difference between the current time and the given date.
 *
 * @params timestamp - The date to compare against. Can be a Date object or a timestamp in milliseconds.
 */
const getDateDifference = (timestamp: Date | number) => {
  const dateDiff =
    (typeof timestamp === 'number' ? timestamp : timestamp.getTime()) -
    Date.now()
  const absDiff = Math.abs(dateDiff)

  if (absDiff >= MS_IN_YEAR) {
    return dateDiffFormatter.format(Math.trunc(dateDiff / MS_IN_YEAR), 'year')
  }

  if (absDiff >= MS_IN_MONTH) {
    return dateDiffFormatter.format(Math.trunc(dateDiff / MS_IN_MONTH), 'month')
  }

  if (absDiff >= MS_IN_WEEK) {
    return dateDiffFormatter.format(Math.trunc(dateDiff / MS_IN_WEEK), 'week')
  }

  if (absDiff >= MS_IN_DAY) {
    return dateDiffFormatter.format(Math.trunc(dateDiff / MS_IN_DAY), 'day')
  }

  if (absDiff >= MS_IN_HOUR) {
    return dateDiffFormatter.format(Math.trunc(dateDiff / MS_IN_HOUR), 'hour')
  }

  if (absDiff >= MS_IN_MINUTE) {
    return dateDiffFormatter.format(
      Math.trunc(dateDiff / MS_IN_MINUTE),
      'minute',
    )
  }

  return 'just now'
}

/**
 * Keeps track of the time difference between the current time and the given date,
 * updating the value every minute.
 *
 * @param timestamp - The date to compare against. Can be a Date object or a timestamp in milliseconds.
 */
export const useDateDifference = (timestamp: Date | number): string => {
  return useTimedValue(() => getDateDifference(timestamp), MS_IN_MINUTE)
}

/**
 * Formats a date as a human-readable string, either as an absolute date or as a relative time difference,
 * depending on the user's settings.
 *
 * @param timestamp - The date to use for display. Can be a Date object or a timestamp in milliseconds.
 */
export const useDateInfo = (timestamp: Date | number) => {
  const { relativeTimestamps } = useSettings()
  const timeAgo = useDateDifference(timestamp)

  if (relativeTimestamps) {
    return timeAgo
  }

  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp

  return `on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
}

/**
 * Promise that resolves after the given time.
 *
 * @param ms - The number of milliseconds to wait for.
 */
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
