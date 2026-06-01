import { client } from '@/api/client'
import type { RepositoryStorage, Settings, Storage } from '@/api/models'
import { storageQuery, useQueryStorage } from '@/api/queries/storage'

/**
 * Returns the currently loaded app storage.
 */
const getStorage = (): Storage => {
  const data = client.getQueryData(storageQuery.queryKey)

  if (!data) {
    throw new Error('App storage not loaded')
  }

  return data
}

/**
 * Returns the currently loaded settings.
 */
const getSettings = (): Settings => {
  return getStorage().settings
}

/**
 * Returns the currently loaded repository-specific storage.
 */
const getRepositoryStorage = (
  repoPath: string,
): RepositoryStorage | undefined => {
  const storage = getStorage()
  const repoStorage = storage.perRepository.get(repoPath)

  return repoStorage
}

/**
 * Tracks the currently loaded app storage.
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
 */
const useSettings = (): Settings => {
  const storage = useStorage()

  return storage.settings
}

export {
  getStorage,
  getRepositoryStorage,
  getSettings,
  useStorage,
  useSettings,
}
