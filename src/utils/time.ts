import { useEffect, useRef, useState } from 'react'

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
const useTimedValue = <T>(factory: () => T, interval: number) => {
  const isSet = useRef(false)
  const [value, setValue] = useState(factory())

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
 * @params date - The date to compare against. Can be a Date object or a timestamp in milliseconds.
 */
const getDateDifference = (date: Date | number) => {
  const dateDiff =
    (typeof date === 'number' ? date : date.getTime()) - Date.now()
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
 * @param date - The date to compare against. Can be a Date object or a timestamp in milliseconds.
 * @returns
 */
const useDateDifference = (date: Date | number): string => {
  const getDifference = () => {
    return getDateDifference(date)
  }

  return useTimedValue(getDifference, MS_IN_MINUTE)
}

/**
 * Promise that resolves after the given time.
 *
 * @param ms - The duration in milliseconds to wait.
 */
const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { useTimedValue, useDateDifference, sleep }
