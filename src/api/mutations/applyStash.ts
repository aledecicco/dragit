import { IconPackageExport } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

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

const useApplyStash = (stashId: string): Action => {
  const applyStash = useRepositoryMutation(applyStashMutation)

  return {
    id: `apply_stash:${stashId}`,
    run: async () => {
      await applyStash.mutateAsync({ stashId })
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
