import { IconPlaylistAdd, IconPlus } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { WorktreeFileInfo } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'

interface AddToIndexArgs {
  files: string[]
}

const addToIndexKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'add_to_index',
  }) as const

const addToIndexMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [addToIndexKey(repoPath)],
    mutationFn: (args: AddToIndexArgs) => {
      return invoke('add_to_index', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useStageFile = (file: WorktreeFileInfo): Action => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: `add_file:${file.path}`,
    run: async () => {
      await addToIndex.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Stage',
      running: 'Staging',
      success: 'Staged',
      error: 'Failed to stage',
    },
    Glyph: IconPlus,
  }
}

const useStageFiles = (): Action<string[]> => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: 'add_files',
    run: async (files) => {
      await addToIndex.mutateAsync({
        files,
      })
    },
    label: {
      idle: 'Stage Files',
      running: 'Staging',
      success: 'Staged',
      error: 'Staging failed',
    },
    Glyph: IconPlaylistAdd,
  }
}

export {
  useStageFile,
  useStageFiles,
  addToIndexKey,
  addToIndexMutation,
  type AddToIndexArgs,
}
