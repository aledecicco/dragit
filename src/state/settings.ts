import { client } from '@/api/client'
import type { Settings } from '@/api/models'
import { settingsQuery, useQuerySettings } from '@/api/queries/settings'

/**
 * Returns the currently loaded settings.
 */
const getSettings = (): Settings => {
  const data = client.getQueryData(settingsQuery.queryKey)

  if (!data) {
    throw new Error('Settings not loaded')
  }

  return data
}

/**
 * Tracks the currently loaded settings.
 */
const useSettings = (): Settings => {
  const { data } = useQuerySettings()

  if (!data) {
    throw new Error('Settings not loaded')
  }

  return data
}

export { getSettings, useSettings }
