import { IconUpload } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'
import { useSelectedUpstream } from '@/state/upstream'
import { useCurrentBranch } from '@/utils/repository'

import type { RemoteName, TagName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface PushTagArgs {
  tag: TagName
  remote: RemoteName
}

const pushTagKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'push_tag',
  }) as const

const pushTagMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [pushTagKey(repoPath)],
    mutationFn: (args: PushTagArgs) => {
      return invoke('push_tag', { repoPath, ...args })
    },
    networkMode: 'online',
  })

const usePushTag = (tag: TagName): Action => {
  const currentBranch = useCurrentBranch()
  const upstream = useSelectedUpstream(currentBranch)

  const pushTag = useRepositoryMutation(pushTagMutation)

  return {
    id: {
      key: 'tag_operation',
      operation: 'push',
      tag,
    },
    blockedBy: [{ key: 'tag_operation', tag }],
    run: async () => {
      if (!upstream) {
        throw new Error('No upstream set')
      }

      await pushTag.mutateAsync({
        tag,
        remote: upstream.remote,
      })
    },
    label: {
      idle: 'Push',
      running: 'Pushing',
      success: 'Pushed',
      error: 'Failed to push',
    },
    Glyph: IconUpload,
  }
}

export { usePushTag, pushTagKey, pushTagMutation, type PushTagArgs }
