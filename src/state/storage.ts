import { client } from '@/api/client'
import type { RepositoryStorage, Settings, Storage } from '@/api/models'
import { currentDirQuery } from '@/api/queries/currentDir'
import { storageQuery, useQueryStorage } from '@/api/queries/storage'
import { useCurrentPath } from '@/api/utils'

/**
 * @returns The currently loaded app storage.
 * @throws If the storage is not loaded yet.
 */
const getStorage = (): Storage => {
  const storage = client.getQueryData(storageQuery.queryKey)

  if (!storage) {
    throw new Error('App storage not loaded')
  }

  return storage
}

/**
 * @returns The currently loaded settings.
 * @throws If the storage is not loaded yet.
 */
const getSettings = (): Settings => {
  return getStorage().settings
}

/**
 * @returns A repository-specific storage.
 * @throws If the storage is not loaded yet.
 */
const getRepositoryStorage = (
  repoPath: string,
): RepositoryStorage | undefined => {
  const storage = getStorage()
  const repoStorage = storage.repoSpecific.get(repoPath)

  return repoStorage
}

/**
 * @returns The repository-specific storage for the currently loaded repository.
 * @throws If there is no repository currently loaded.
 */
const getCurrentRepositoryStorage = (): RepositoryStorage | undefined => {
  const currentDir = client.getQueryData(currentDirQuery.queryKey)

  if (!currentDir) {
    throw new Error('Path not loaded')
  }

  return getRepositoryStorage(currentDir.path)
}

/**
 * Tracks the currently loaded app storage.
 * @throws If the storage is not loaded yet.
 */
const useStorage = (): Storage => {
  const { data } = useQueryStorage()

  if (!data) {
    throw new Error('App storage not loaded')
  }

  return data
}
/**
 * Tracks the currently loaded settings.
 * @throws If the storage is not loaded yet.
 */
const useSettings = (): Settings => {
  const storage = useStorage()

  return storage.settings
}

/**
 * Tracks the repository-specific storage for the currently loaded repository.
 */
const useCurrentRepositoryStorage = (): RepositoryStorage | undefined => {
  const currentPath = useCurrentPath()
  const storage = useStorage()
  const repoStorage = storage.repoSpecific.get(currentPath)

  return repoStorage
}

export {
  getStorage,
  getRepositoryStorage,
  getCurrentRepositoryStorage,
  getSettings,
  useStorage,
  useSettings,
  useCurrentRepositoryStorage,
}
