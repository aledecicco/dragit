import { IconCheck, IconListCheck, IconPlus } from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { WorktreeFileInfo } from '../models'
import { mutationOptions, useRepositoryMutation } from '../utils'
import { pathMutationKey } from '.'

interface AddToIndexArgs {
  files: string[]
}

const addToIndexKey = (path: string) =>
  ({
    ...pathMutationKey(path),
    key: 'add_to_index',
  }) as const

const addToIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [addToIndexKey(path)],
    mutationFn: (args: AddToIndexArgs) => {
      return invoke('add_to_index', { path, ...args })
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

const useMarkAsResolved = (file: WorktreeFileInfo): Action => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: `add_file:${file.path}`,
    run: async () => {
      await addToIndex.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Mark as resolved',
      running: 'Resolving',
      success: 'Resolved',
      error: 'Failed to resolve',
    },
    Glyph: IconCheck,
  }
}

const useAddFiles = (): Action<string[]> => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: 'add_files',
    run: async (files) => {
      await addToIndex.mutateAsync({
        files,
      })
    },
    label: {
      idle: 'Add Files',
      running: 'Adding',
      success: 'Added',
      error: 'Failed to add',
    },
    Glyph: IconListCheck,
  }
}

export {
  useStageFile,
  useMarkAsResolved,
  useAddFiles,
  addToIndexKey,
  type AddToIndexArgs,
}
