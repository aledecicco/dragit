import { IconTrash } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { StashId, StashInfo } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface DiscardStashArgs {
  stashId: StashId
}

const discardStashKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'discard_stash',
  }) as const

const discardStashMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [discardStashKey(repoPath)],
    mutationFn: (args: DiscardStashArgs) => {
      return invoke('discard_stash', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useDiscardStash = (stash: StashInfo): Action => {
  const discardStash = useRepositoryMutation(discardStashMutation)

  return {
    id: `discard_stash:${stash.id}`,
    run: async () => {
      await discardStash.mutateAsync({ stashId: stash.id })
    },
    label: {
      idle: 'Discard',
      running: 'Discarding',
      success: 'Discarded',
      error: 'Failed',
    },
    Glyph: IconTrash,
  }
}

export {
  useDiscardStash,
  discardStashKey,
  discardStashMutation,
  type DiscardStashArgs,
}
