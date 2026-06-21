import { queryOptions, useQuery } from '@tanstack/react-query'
import { check, type Update } from '@tauri-apps/plugin-updater'

interface UpdateInfo {
  version: string
  date: Date
  description: string | undefined
  rawData: Update
}

const availableUpdateQueryKey = { key: 'available_update' } as const

const fetchAvailableUpdate = async (): Promise<UpdateInfo | null> => {
  const update = await check()

  if (!update) {
    return null
  }

  return {
    version: update.version,
    date: update.date ? new Date(update.date) : new Date(),
    description: update.body,
    rawData: update,
  }
}

const availableUpdateQuery = queryOptions({
  queryKey: [availableUpdateQueryKey],
  queryFn: fetchAvailableUpdate,
})

const useQueryAvailableUpdate = () => useQuery(availableUpdateQuery)

export {
  availableUpdateQuery,
  availableUpdateQueryKey,
  useQueryAvailableUpdate,
  type UpdateInfo,
}
