import { IconPackageExport } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { StashInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface ApplyStashArgs {
  stashId: string
}

const applyStashKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'apply_stash',
  }) as const

const applyStashMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [applyStashKey(repoPath)],
    mutationFn: (args: ApplyStashArgs) => {
      return invoke('apply_stash', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useApplyStash = (stash: StashInfo): Action => {
  const applyStash = useRepositoryMutation(applyStashMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'apply_stash',
      stash: stash.tracker,
    },
    blockedBy: [
      { key: 'file_operation' },
      { stash: stash.tracker },
      { key: 'modify_branch', type: 'current' },
    ],
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

export { useApplyStash, applyStashKey, applyStashMutation, type ApplyStashArgs }
