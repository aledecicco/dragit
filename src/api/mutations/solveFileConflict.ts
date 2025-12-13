import {
  IconCancel,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconTrashOff,
} from '@tabler/icons-react'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { ResolutionStrategy, UnmergedFileInfo } from '../models'
import {
  mutationOptions,
  pathMutationKey,
  useRepositoryMutation,
} from '../utils'
import { addToIndexMutation } from './addToIndex'
import { removeFromTreeMutation } from './removeFromTree'

interface SolveFileConflictArgs {
  filepath: string
  strategy: ResolutionStrategy
}

const solveFileConflictKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'solve_file_conflict',
  }) as const

const solveFileConflictMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [solveFileConflictKey(repoPath)],
    mutationFn: (args: SolveFileConflictArgs) => {
      return invoke('solve_file_conflict', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useAcceptOurs = (file: UnmergedFileInfo): Action => {
  const solveFileConflict = useRepositoryMutation(solveFileConflictMutation)
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'ours',
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'modify_branch', type: 'current' },
    ],
    run: async () => {
      await solveFileConflict.mutateAsync({
        filepath: file.path,
        strategy: 'ours',
      })
      await addToIndex.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Accept ours',
      running: 'Accepting ours',
      success: 'Ours accepted',
      error: 'Failed to accept ours',
    },
    Glyph: IconChevronLeft,
  }
}

const useAcceptTheirs = (file: UnmergedFileInfo): Action => {
  const solveFileConflict = useRepositoryMutation(solveFileConflictMutation)
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'theirs',
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'modify_branch', type: 'current' },
    ],
    run: async () => {
      await solveFileConflict.mutateAsync({
        filepath: file.path,
        strategy: 'theirs',
      })
      await addToIndex.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Accept theirs',
      running: 'Accepting theirs',
      success: 'Theirs accepted',
      error: 'Failed to accept theirs',
    },
    Glyph: IconChevronRight,
  }
}

const useAcceptAsIs = (file: UnmergedFileInfo): Action => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'manual',
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'modify_branch', type: 'current' },
    ],
    run: async () => {
      await addToIndex.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Accept as is',
      running: 'Accepting as is',
      success: 'Accepted as is',
      error: 'Failed to accept as is',
    },
    Glyph: IconCheck,
  }
}

const useAcceptDeletion = (file: UnmergedFileInfo): Action => {
  const removeFromTree = useRepositoryMutation(removeFromTreeMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'delete',
    },
    blockedBy: [{ key: 'file_operation', file: file.path }],
    run: async () => {
      await removeFromTree.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Accept deletion',
      running: 'Accepting deletion',
      success: 'Accepted deletion',
      error: 'Failed to accept deletion',
    },
    Glyph: IconTrash,
  }
}

const useIgnoreDeletion = (file: UnmergedFileInfo): Action => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'dont_delete',
    },
    blockedBy: [{ key: 'file_operation', file: file.path }],
    run: async () => {
      await addToIndex.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Ignore deletion',
      running: 'Ignoreing deletion',
      success: 'Ignored deletion',
      error: 'Failed to ignore deletion',
    },
    Glyph: IconTrashOff,
  }
}

const useAcceptFile = (file: UnmergedFileInfo): Action => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'accept',
    },
    blockedBy: [{ key: 'file_operation', file: file.path }],
    run: async () => {
      await addToIndex.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Accept new file',
      running: 'Accepting new file',
      success: 'Accepted new file',
      error: 'Failed to accept new file',
    },
    Glyph: IconCheck,
  }
}

const useIgnoreFile = (file: UnmergedFileInfo): Action => {
  const removeFromTree = useRepositoryMutation(removeFromTreeMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'ignore',
    },
    blockedBy: [{ key: 'file_operation', file: file.path }],
    run: async () => {
      await removeFromTree.mutateAsync({ files: [file.path] })
    },
    label: {
      idle: 'Ignore new file',
      running: 'Ignoring new file',
      success: 'Ignored new file',
      error: 'Failed to ignore new file',
    },
    Glyph: IconCancel,
  }
}

export {
  useAcceptOurs,
  useAcceptTheirs,
  useAcceptAsIs,
  useAcceptDeletion,
  useIgnoreDeletion,
  useAcceptFile,
  useIgnoreFile,
  solveFileConflictKey,
  solveFileConflictMutation,
  type SolveFileConflictArgs,
}
