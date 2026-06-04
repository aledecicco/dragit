import { IconCloudDownload } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'
import { relaunch } from '@tauri-apps/plugin-process'
import { match } from 'ts-pattern'

import type { Action } from '@/state/actions'

import {
  type UpdateInfo,
  useQueryAvailableUpdate,
} from '../queries/availableUpdate'

interface InstallUpdateArgs {
  update: UpdateInfo
  onProgress?: (progress: number) => void
}

const installUpdateKey = {
  key: 'install_update',
} as const

const installUpdateMutation = mutationOptions({
  mutationKey: [installUpdateKey],
  mutationFn: (args: InstallUpdateArgs) => {
    let totalLength = 0
    let downloadedLength = 0

    return args.update.rawData.downloadAndInstall((progress) => {
      match(progress)
        .with({ event: 'Started' }, ({ data }) => {
          totalLength = data.contentLength ?? 0
        })
        .with({ event: 'Progress' }, ({ data }) => {
          downloadedLength += data.chunkLength
          if (totalLength > 0) {
            args.onProgress?.(
              Number.parseFloat(
                ((downloadedLength / totalLength) * 100).toFixed(2),
              ),
            )
          }
        })
        .with({ event: 'Finished' }, () => {
          args.onProgress?.(100)
        })
        .exhaustive()
    })
  },
  networkMode: 'online',
})

const useInstallUpdate = (onProgress?: (progress: number) => void): Action => {
  const availableUpdate = useQueryAvailableUpdate()
  const installUpdate = useMutation(installUpdateMutation)

  return {
    id: { key: 'install_update' },
    run: async () => {
      if (!availableUpdate.data) {
        throw new Error('No update available')
      }

      await installUpdate.mutateAsync({
        update: availableUpdate.data,
        onProgress,
      })

      relaunch()
    },
    label: {
      idle: 'Install update',
      running: 'Updating',
      success: 'Update installed',
      error: 'Failed to update',
    },
    Glyph: IconCloudDownload,
  }
}

export { useInstallUpdate }
