import { IconBlocks } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { pathMutationKey, useRepositoryMutation } from '../utils'

const initRepositoryKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'init_repository',
  }) as const

const initRepositoryMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [initRepositoryKey(repoPath)],
    mutationFn: () => {
      return invoke('init_repository', { repoPath })
    },
    networkMode: 'always',
  })

const useInitRepository = (): Action => {
  const initRepository = useRepositoryMutation(initRepositoryMutation)

  return {
    id: { key: 'init_repository' },
    run: async () => {
      await initRepository.mutateAsync()
    },
    label: {
      idle: 'Init repository',
      running: 'Initializing',
      success: 'Initialized',
      error: 'Failed to initialize',
    },
    Glyph: IconBlocks,
  }
}

export { useInitRepository, initRepositoryKey, initRepositoryMutation }
