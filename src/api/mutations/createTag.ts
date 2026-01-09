import { IconTag } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { BranchInfo, CommitInfo } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface CreateTagArgs {
  tagName: string
  reference: string
  message: string | null
}

const createTagKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'create_tag',
  }) as const

const createTagMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [createTagKey(repoPath)],
    mutationFn: (args: CreateTagArgs) => {
      return invoke('tag', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useTagBranch = (
  branch: BranchInfo,
): Action<Omit<CreateTagArgs, 'reference'>> => {
  const createTag = useRepositoryMutation(createTagMutation)

  return {
    id: { key: 'tag_operation', operation: 'create_tag', branch: branch.name },
    blockedBy: [{ key: 'tag_operation', branch: branch.name }],
    run: async (args) => {
      await createTag.mutateAsync({
        tagName: args.tagName,
        reference: branch.name,
        message: args.message,
      })
    },
    label: {
      idle: 'Tag branch',
      running: 'Tagging',
      success: 'Tagged',
      error: 'Failed',
    },
    Glyph: IconTag,
  }
}

const useTagCommit = (
  commit: CommitInfo,
): Action<Omit<CreateTagArgs, 'reference'>> => {
  const createTag = useRepositoryMutation(createTagMutation)

  return {
    id: { key: 'tag_operation', operation: 'create_tag', commit: commit.id },
    blockedBy: [{ key: 'tag_operation', commit: commit.id }],
    run: async (args) => {
      await createTag.mutateAsync({
        tagName: args.tagName,
        reference: commit.id,
        message: args.message,
      })
    },
    label: {
      idle: 'Tag commit',
      running: 'Tagging',
      success: 'Tagged',
      error: 'Failed',
    },
    Glyph: IconTag,
  }
}

export {
  useTagBranch,
  useTagCommit,
  createTagKey,
  createTagMutation,
  type CreateTagArgs,
}
