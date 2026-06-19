import type { RepositoryStorage, Settings } from '@/api/models'
import { useSetRepositoryStorage } from '@/api/mutations/setRepositoryStorage'
import { useSetSettings } from '@/api/mutations/setSettings'
import { interaction } from '@/lib/ActionButton/utils'

export const useSetSettingInteraction = () => {
  const setSettings = useSetSettings()

  return <K extends keyof Settings>(setting: K, value: Settings[K]) =>
    interaction({
      action: setSettings,
      argsRequester: () => ({ [setting]: value }) as Partial<Settings>,
      details: 'update app settings',
    })
}

export const useSetRepositoryStorageInteraction = () => {
  const setRepositoryStorage = useSetRepositoryStorage()

  return (update: Partial<RepositoryStorage>) =>
    interaction({
      action: setRepositoryStorage,
      argsRequester: () => update,
      details: 'update repository settings',
    })
}
