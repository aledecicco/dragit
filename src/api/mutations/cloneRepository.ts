import { IconBrandGithub } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

interface CloneRepositoryArgs {
  url: string
}

const cloneRepositoryKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'clone_repository',
  }) as const

const cloneRepositoryMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [cloneRepositoryKey(repoPath)],
    mutationFn: (args: CloneRepositoryArgs) => {
      return invoke('clone_repository', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useCloneRepository = (): Action<string> => {
  const cloneRepository = useRepositoryMutation(cloneRepositoryMutation)

  return {
    id: { key: 'clone_repository' },
    run: async (url) => {
      await cloneRepository.mutateAsync({ url })
    },
    label: {
      idle: 'Clone from URL',
      running: 'Cloning',
      success: 'Cloned',
      error: 'Failed to clone',
    },
    Glyph: IconBrandGithub,
  }
}

export { useCloneRepository, cloneRepositoryKey, cloneRepositoryMutation }
