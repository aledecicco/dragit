import { IconBlocks } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

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
    id: 'init_repository',
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

export { useInitRepository, initRepositoryKey }
