import { IconRestore, IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { RefName, VersionedFileInfo, WorktreeFileInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface RestoreArgs {
  reference: string | null
  files: string[]
  isStaged: boolean
  isWorktree: boolean
}

interface CleanFilesArgs {
  files: string[]
}

const restoreKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'restore',
  }) as const

const restoreMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [restoreKey(repoPath)],
    mutationFn: (args: RestoreArgs) => {
      return invoke('restore', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const cleanFilesKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'clean_files',
  }) as const

const cleanFilesMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [cleanFilesKey(repoPath)],
    mutationFn: (args: CleanFilesArgs) => {
      return invoke('clean_files', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useMakeDiscardFileChanges = (): ((file: WorktreeFileInfo) => Action) => {
  const restoreFiles = useRepositoryMutation(restoreMutation)
  const cleanFiles = useRepositoryMutation(cleanFilesMutation)

  return (file: WorktreeFileInfo): Action => ({
    id: {
      key: 'file_operation',
      operation: 'discard_file_changes',
      file: file.path,
      status: file.status,
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async () => {
      if (file.status === 'untracked') {
        await cleanFiles.mutateAsync({ files: [file.path] })
      } else {
        await restoreFiles.mutateAsync({
          files: [file.path],
          reference: null,
          isStaged: file.status === 'staged',
          isWorktree: true,
        })
      }
    },
    label: {
      idle: 'Discard changes',
      running: 'Discarding changes',
      success: 'Changes discarded',
      error: 'Failed to discard changes',
    },
    Glyph: IconTrash,
  })
}

const useDiscardFileChanges = (file: WorktreeFileInfo): Action => {
  return useMakeDiscardFileChanges()(file)
}

const useDiscardChanges = (): Action<WorktreeFileInfo[]> => {
  const restoreFiles = useRepositoryMutation(restoreMutation)
  const cleanFiles = useRepositoryMutation(cleanFilesMutation)

  return {
    id: { key: 'file_operation', operation: 'discard_file_changes' },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      const untrackedFiles = files.filter((file) => file.status === 'untracked')
      const stagedFiles = files.filter((file) => file.status === 'staged')
      const unstagedFiles = files.filter(
        (file) => file.status === 'unstaged' || file.status === 'unmerged',
      )

      if (untrackedFiles.length > 0) {
        await cleanFiles.mutateAsync({
          files: untrackedFiles.map((file) => file.path),
        })
      }

      if (stagedFiles.length > 0) {
        await restoreFiles.mutateAsync({
          files: stagedFiles.map((file) => file.path),
          reference: null,
          isStaged: true,
          isWorktree: true,
        })
      }

      if (unstagedFiles.length > 0) {
        await restoreFiles.mutateAsync({
          files: unstagedFiles.map((file) => file.path),
          reference: null,
          isStaged: false,
          isWorktree: true,
        })
      }
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'discard_file_changes',
        file: file.path,
        status: file.status,
      })),
    label: {
      idle: 'Discard changes',
      running: 'Discarding changes',
      success: 'Changes discarded',
      error: 'Failed to discard changes',
    },
    Glyph: IconTrash,
  }
}

const useRestoreFileState = (
  file: VersionedFileInfo,
  snapshot: RefName,
): Action => {
  const restore = useRepositoryMutation(restoreMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'restore',
      file: file.path,
      snapshot,
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation', file: file.path },
    ],
    run: async () => {
      await restore.mutateAsync({
        reference: file.changes === 'deleted' ? `${snapshot}~1` : snapshot,
        files: [file.path],
        isStaged: false,
        isWorktree: false,
      })
    },
    label: {
      idle: 'Restore file contents',
      running: 'Restoring file contents',
      success: 'File contents restored',
      error: 'Failed to restore file contents',
    },
    Glyph: IconRestore,
  }
}

const useRestoreFileStates = (
  snapshot: RefName,
): Action<VersionedFileInfo[]> => {
  const restore = useRepositoryMutation(restoreMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'restore',
      snapshot,
    },
    blockedBy: [
      { key: 'branch_operation', type: 'current' },
      { key: 'file_operation' },
    ],
    run: async (files) => {
      const changedFiles = files.filter((file) => file.changes !== 'deleted')
      const deletedFiles = files.filter((file) => file.changes === 'deleted')

      if (changedFiles.length > 0) {
        await restore.mutateAsync({
          reference: snapshot,
          files: changedFiles.map((file) => file.path),
          isStaged: false,
          isWorktree: false,
        })
      }

      if (deletedFiles.length > 0) {
        await restore.mutateAsync({
          reference: `${snapshot}~1`,
          files: deletedFiles.map((file) => file.path),
          isStaged: false,
          isWorktree: true,
        })
      }
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'restore',
        snapshot,
        file: file.path,
      })),
    label: {
      idle: 'Restore file contents',
      running: 'Restoring file contents',
      success: 'File contents restored',
      error: 'Failed to restore file contents',
    },
    Glyph: IconRestore,
  }
}

export {
  useMakeDiscardFileChanges,
  useDiscardFileChanges,
  useDiscardChanges,
  useRestoreFileState,
  useRestoreFileStates,
  restoreKey,
  restoreMutation,
  cleanFilesKey,
  cleanFilesMutation,
  type RestoreArgs,
  type CleanFilesArgs,
}
