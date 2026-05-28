import { queryOptions, useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { RepositoryStorage, Storage } from '../models'

type StorageResponse = Storage & {
  perRepository: [string, RepositoryStorage][]
}

const storageQueryKey = { key: 'storage' } as const

const fetchStorage = async (): Promise<Storage> => {
  const res = await invoke<StorageResponse>('get_app_storage')

  return {
    ...res,
    perRepository: new Map(res.perRepository),
  }
}

const storageQuery = queryOptions({
  queryKey: [storageQueryKey],
  queryFn: fetchStorage,
})

const useQueryStorage = () => useQuery(storageQuery)

export { storageQuery, storageQueryKey, useQueryStorage }
