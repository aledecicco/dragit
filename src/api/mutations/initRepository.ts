import { IconBlocks } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

const initRepositoryKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'init_repository',
  }) as const

const initRepositoryMutation = (path: string) =>
  mutationOptions({
    mutationKey: [initRepositoryKey(path)],
    mutationFn: () => {
      return invoke('init_repository', { path: path })
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
