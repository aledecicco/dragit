import { useCheckUpdates } from '@/api/mutations/checkUpdates'
import { useInstallUpdate } from '@/api/mutations/installUpdate'
import { interaction } from '@/lib/ActionButton/utils'

export const useCheckForUpdatesInteraction = () => {
  const checkUpdates = useCheckUpdates()

  return interaction({ action: checkUpdates, details: 'check for updates' })
}

export const useInstallUpdateInteraction = (
  onProgress?: (progress: number) => void,
) => {
  const installUpdate = useInstallUpdate(onProgress)

  return interaction({ action: installUpdate, details: 'install update' })
}
