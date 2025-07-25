import { IconPackageExport } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { StashInfo } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

interface ApplyStashArgs {
  stashId: string
}

const applyStashKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'apply_stash',
  }) as const

const applyStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [applyStashKey(path)],
    mutationFn: (args: ApplyStashArgs) => {
      return invoke('apply_stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useApplyStash = (stash: StashInfo): Action => {
  const applyStash = useRepositoryMutation(applyStashMutation)

  return {
    id: `apply_stash:${stash.id}`,
    run: async () => {
      await applyStash.mutateAsync({ stashId: stash.id })
    },
    label: {
      idle: 'Apply',
      running: 'Applying',
      success: 'Applied',
      error: 'Failed',
    },
    Glyph: IconPackageExport,
  }
}

export { useApplyStash, applyStashKey, type ApplyStashArgs }
