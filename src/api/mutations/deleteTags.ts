import { IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { TagInfo, TagName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface DeleteTagsArgs {
  tagNames: TagName[]
}

const deleteTagsKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'delete_tags',
  }) as const

const deleteTagsMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [deleteTagsKey(repoPath)],
    mutationFn: (args: DeleteTagsArgs) => {
      return invoke('delete_local_tags', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useMakeDeleteTag = (): ((tag: TagInfo) => Action) => {
  const deleteTags = useRepositoryMutation(deleteTagsMutation)

  return (tag: TagInfo): Action => ({
    id: { key: 'tag_operation', operation: 'delete_tag', tag: tag.name },
    blockedBy: [{ key: 'tag_operation', tag: tag.name }],
    run: async () => {
      await deleteTags.mutateAsync({ tagNames: [tag.name] })
    },
    label: {
      idle: 'Delete tag',
      running: 'Deleting tag',
      success: 'Tag deleted',
      error: 'Failed to delete',
    },
    Glyph: IconTrash,
  })
}

const useDeleteTags = (): Action<TagInfo[]> => {
  const deleteTags = useRepositoryMutation(deleteTagsMutation)

  return {
    id: { key: 'tag_operation', operation: 'delete_tags' },
    blockedBy: [{ key: 'tag_operation' }],
    run: async (tags) => {
      await deleteTags.mutateAsync({ tagNames: tags.map((tag) => tag.name) })
    },
    derivedIds: (tags) =>
      tags.map((tag) => ({
        key: 'tag_operation',
        operation: 'delete_tag',
        tag: tag.name,
      })),
    label: {
      idle: 'Delete tags',
      running: 'Deleting tags',
      success: 'Tags deleted',
      error: 'Failed to delete',
    },
    Glyph: IconTrash,
  }
}

export {
  useMakeDeleteTag,
  useDeleteTags,
  deleteTagsKey,
  deleteTagsMutation,
  type DeleteTagsArgs,
}
