import {
  IconCancel,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconTrashOff,
} from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { ResolutionStrategy, WorktreeFileInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'
import { addToIndexMutation } from './addToIndex'
import { removeFromTreeMutation } from './removeFromTree'

interface SolveFileConflictsArgs {
  files: string[]
  strategy: ResolutionStrategy
}

const solveFileConflictsKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'solve_file_conflicts',
  }) as const

const solveFileConflictsMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [solveFileConflictsKey(repoPath)],
    mutationFn: (args: SolveFileConflictsArgs) => {
      return invoke('solve_file_conflicts', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useAcceptOurs = (file: WorktreeFileInfo): Action => {
  const solveFileConflicts = useRepositoryMutation(solveFileConflictsMutation)
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
      { key: 'branch_operation', type: 'current' },
    ],
    run: async () => {
      await solveFileConflicts.mutateAsync({
        files: [file.path],
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

const useAcceptManyOurs = (): Action<WorktreeFileInfo[]> => {
  const solveFileConflicts = useRepositoryMutation(solveFileConflictsMutation)
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict_many',
      resolution: 'ours',
    },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await solveFileConflicts.mutateAsync({
        files: files.map((file) => file.path),
        strategy: 'ours',
      })
      await addToIndex.mutateAsync({ files: files.map((file) => file.path) })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'solve_conflict',
        file: file.path,
        resolution: 'ours',
      })),
    label: {
      idle: 'Accept ours',
      running: 'Accepting ours',
      success: 'Ours accepted',
      error: 'Failed to accept ours',
    },
    Glyph: IconChevronLeft,
  }
}

const useAcceptTheirs = (file: WorktreeFileInfo): Action => {
  const solveFileConflicts = useRepositoryMutation(solveFileConflictsMutation)
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
      { key: 'branch_operation', type: 'current' },
    ],
    run: async () => {
      await solveFileConflicts.mutateAsync({
        files: [file.path],
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

const useAcceptManyTheirs = (): Action<WorktreeFileInfo[]> => {
  const solveFileConflicts = useRepositoryMutation(solveFileConflictsMutation)
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict_many',
      resolution: 'theirs',
    },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await solveFileConflicts.mutateAsync({
        files: files.map((file) => file.path),
        strategy: 'theirs',
      })
      await addToIndex.mutateAsync({ files: files.map((file) => file.path) })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'solve_conflict',
        file: file.path,
        resolution: 'theirs',
      })),
    label: {
      idle: 'Accept theirs',
      running: 'Accepting theirs',
      success: 'Theirs accepted',
      error: 'Failed to accept theirs',
    },
    Glyph: IconChevronRight,
  }
}

const useAcceptAsIs = (file: WorktreeFileInfo): Action => {
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
      { key: 'branch_operation', type: 'current' },
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

const useAcceptManyAsIs = (): Action<WorktreeFileInfo[]> => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict_many',
      resolution: 'manual',
    },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await addToIndex.mutateAsync({ files: files.map((file) => file.path) })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'solve_conflict',
        file: file.path,
        resolution: 'manual',
      })),
    label: {
      idle: 'Accept as they are',
      running: 'Accepting as they are',
      success: 'Accepted as they are',
      error: 'Failed to accept as they are',
    },
    Glyph: IconCheck,
  }
}

const useAcceptDeletion = (file: WorktreeFileInfo): Action => {
  const removeFromTree = useRepositoryMutation(removeFromTreeMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'delete',
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
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

const useAcceptManyDeletions = (): Action<WorktreeFileInfo[]> => {
  const removeFromTree = useRepositoryMutation(removeFromTreeMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict_many',
      resolution: 'delete',
    },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await removeFromTree.mutateAsync({
        files: files.map((file) => file.path),
      })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'solve_conflict',
        file: file.path,
        resolution: 'delete',
      })),
    label: {
      idle: 'Accept deletions',
      running: 'Accepting deletions',
      success: 'Accepted deletions',
      error: 'Failed to accept deletions',
    },
    Glyph: IconTrash,
  }
}

const useIgnoreDeletion = (file: WorktreeFileInfo): Action => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'dont_delete',
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
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

const useIgnoreManyDeletions = (): Action<WorktreeFileInfo[]> => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict_many',
      resolution: 'dont_delete',
    },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await addToIndex.mutateAsync({ files: files.map((file) => file.path) })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'solve_conflict',
        file: file.path,
        resolution: 'dont_delete',
      })),
    label: {
      idle: 'Ignore deletions',
      running: 'Ignoring deletions',
      success: 'Ignored deletions',
      error: 'Failed to ignore deletions',
    },
    Glyph: IconTrashOff,
  }
}

const useAcceptFile = (file: WorktreeFileInfo): Action => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'accept',
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
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

const useAcceptManyFiles = (): Action<WorktreeFileInfo[]> => {
  const addToIndex = useRepositoryMutation(addToIndexMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict_many',
      resolution: 'accept',
    },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await addToIndex.mutateAsync({ files: files.map((file) => file.path) })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'solve_conflict',
        file: file.path,
        resolution: 'accept',
      })),
    label: {
      idle: 'Accept new files',
      running: 'Accepting new files',
      success: 'Accepted new files',
      error: 'Failed to accept new files',
    },
    Glyph: IconCheck,
  }
}

const useIgnoreFile = (file: WorktreeFileInfo): Action => {
  const removeFromTree = useRepositoryMutation(removeFromTreeMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict',
      file: file.path,
      resolution: 'ignore',
    },
    blockedBy: [
      { key: 'file_operation', file: file.path },
      { key: 'branch_operation', type: 'current' },
    ],
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

const useIgnoreManyFiles = (): Action<WorktreeFileInfo[]> => {
  const removeFromTree = useRepositoryMutation(removeFromTreeMutation)

  return {
    id: {
      key: 'file_operation',
      operation: 'solve_conflict_many',
      resolution: 'ignore',
    },
    blockedBy: [
      { key: 'file_operation' },
      { key: 'branch_operation', type: 'current' },
    ],
    run: async (files) => {
      await removeFromTree.mutateAsync({
        files: files.map((file) => file.path),
      })
    },
    derivedIds: (files) =>
      files.map((file) => ({
        key: 'file_operation',
        operation: 'solve_conflict',
        file: file.path,
        resolution: 'ignore',
      })),
    label: {
      idle: 'Ignore new files',
      running: 'Ignoring new files',
      success: 'Ignored new files',
      error: 'Failed to ignore new files',
    },
    Glyph: IconCancel,
  }
}

export {
  useAcceptOurs,
  useAcceptManyOurs,
  useAcceptTheirs,
  useAcceptManyTheirs,
  useAcceptAsIs,
  useAcceptManyAsIs,
  useAcceptDeletion,
  useAcceptManyDeletions,
  useIgnoreDeletion,
  useIgnoreManyDeletions,
  useAcceptFile,
  useAcceptManyFiles,
  useIgnoreFile,
  useIgnoreManyFiles,
  solveFileConflictsKey,
  solveFileConflictsMutation,
  type SolveFileConflictsArgs,
}
