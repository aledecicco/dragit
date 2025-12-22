import { IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { StashId, StashInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

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
    id: { key: 'stash_operation', operation: 'discard', stash: stash.tracker },
    blockedBy: [{ stash: stash.tracker }],
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
