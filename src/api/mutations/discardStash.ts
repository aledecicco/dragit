import { IconTrash } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const discardStashKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'discard_stash',
  }) as const

const discardStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [discardStashKey(path)],
    mutationFn: (args: { stashId: string }) => {
      return invoke('discard_stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useDiscardStash = (stashId: string): Action => {
  const discardStash = useRepositoryMutation(discardStashMutation)

  return {
    id: `discard_stash:${stashId}`,
    run: async () => {
      await discardStash.mutateAsync({ stashId })
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

export { useDiscardStash, discardStashKey }
