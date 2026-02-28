import { IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { StashId, StashInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface DiscardStashArgs {
  stashIds: StashId[]
}

const discardStashKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'discard_stashes',
  }) as const

const discardStashMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [discardStashKey(repoPath)],
    mutationFn: (args: DiscardStashArgs) => {
      return invoke('discard_stashes', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useMakeDiscardStash = (): ((stash: StashInfo) => Action) => {
  const discardStash = useRepositoryMutation(discardStashMutation)

  return (stash: StashInfo): Action => ({
    id: { key: 'stash_operation', operation: 'discard', stash: stash.tracker },
    blockedBy: [{ stash: stash.tracker }],
    run: async () => {
      await discardStash.mutateAsync({ stashIds: [stash.id] })
    },
    label: {
      idle: 'Discard',
      running: 'Discarding',
      success: 'Discarded',
      error: 'Failed',
    },
    Glyph: IconTrash,
  })
}

const useDiscardStash = (stash: StashInfo): Action => {
  return useMakeDiscardStash()(stash)
}

const useDiscardStashes = (): Action<StashInfo[]> => {
  const discardStash = useRepositoryMutation(discardStashMutation)

  return {
    id: { key: 'stash_operation', operation: 'discard_many' },
    blockedBy: [{ key: 'stash_operation' }],
    run: async (stashes) => {
      await discardStash.mutateAsync({
        stashIds: stashes.map((stash) => stash.id),
      })
    },
    derivedIds: (stashes) =>
      stashes.map((stash) => ({
        key: 'stash_operation',
        operation: 'discard',
        stash: stash.tracker,
      })),
    label: {
      idle: 'Discard stashes',
      running: 'Discarding stashes',
      success: 'Stashes discarded',
      error: 'Failed to discard',
    },
    Glyph: IconTrash,
  }
}

export {
  useMakeDiscardStash,
  useDiscardStash,
  useDiscardStashes,
  discardStashKey,
  discardStashMutation,
  type DiscardStashArgs,
}
