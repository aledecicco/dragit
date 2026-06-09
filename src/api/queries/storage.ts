import { queryOptions, useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { BranchName, Reference, Storage, Upstream } from '../models'

type StorageResponse = Storage & {
  repoSpecific: [
    string,
    {
      branchBases: [BranchName, Reference | null][]
      branchUpstreams: [BranchName, Upstream][]
      defaultBase: string
    },
  ][]
}

const storageQueryKey = { key: 'storage' } as const

const fetchStorage = async (): Promise<Storage> => {
  const res = await invoke<StorageResponse>('get_app_storage')

  return {
    ...res,
    repoSpecific: new Map(
      res.repoSpecific.map(([repoPath, repoStorage]) => [
        repoPath,
        {
          branchBases: new Map(repoStorage.branchBases),
          branchUpstreams: new Map(repoStorage.branchUpstreams),
          defaultBase: repoStorage.defaultBase,
        },
      ]),
    ),
  }
}

const storageQuery = queryOptions({
  queryKey: [storageQueryKey],
  queryFn: fetchStorage,
})

const useQueryStorage = () => useQuery(storageQuery)

export { storageQuery, storageQueryKey, useQueryStorage }
