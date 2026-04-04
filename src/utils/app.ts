import type { Settings } from '@/api/models'
import { useQuerySettings } from '@/api/queries/settings'

export const useSettings = (): Settings => {
  const settingsQuery = useQuerySettings()

  if (!settingsQuery.data) {
    throw new Error('Settings are not loaded')
  }

  return settingsQuery.data
}
