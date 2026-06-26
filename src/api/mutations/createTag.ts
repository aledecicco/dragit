import { IconTag } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { BranchName, CommitId } from '../models'
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

type TagAction = Action<Omit<CreateTagArgs, 'reference'>>

const useMakeTagBranch = (): ((branch: BranchName) => TagAction) => {
  const createTag = useRepositoryMutation(createTagMutation)

  return (branch: BranchName): TagAction => ({
    id: { key: 'tag_operation', operation: 'create_tag', branch },
    blockedBy: [{ key: 'tag_operation', branch }],
    run: async (args) => {
      await createTag.mutateAsync({
        tagName: args.tagName,
        reference: branch,
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
  })
}

const useMakeTagCommit = (): ((commit: CommitId) => TagAction) => {
  const createTag = useRepositoryMutation(createTagMutation)

  return (commit: CommitId): TagAction => ({
    id: { key: 'tag_operation', operation: 'create_tag', commit },
    blockedBy: [{ key: 'tag_operation', commit }],
    run: async (args) => {
      await createTag.mutateAsync({
        tagName: args.tagName,
        reference: commit,
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
  })
}

export {
  useMakeTagBranch,
  useMakeTagCommit,
  createTagKey,
  createTagMutation,
  type CreateTagArgs,
}
