import { queryOptions, useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Settings } from '../models'

const settingsQueryKey = { key: 'settings' } as const

const fetchSettings = (): Promise<Settings> => invoke('get_settings')

const settingsQuery = queryOptions({
  queryKey: [settingsQueryKey],
  queryFn: fetchSettings,
})

const useQuerySettings = () => useQuery(settingsQuery)

export { settingsQueryKey, useQuerySettings }
