import { IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { TagName } from '../models'
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

const useMakeDeleteTag = (): ((tag: TagName) => Action) => {
  const deleteTags = useRepositoryMutation(deleteTagsMutation)

  return (tag: TagName): Action => ({
    id: { key: 'tag_operation', operation: 'delete_tag', tag },
    blockedBy: [{ key: 'tag_operation', tag }],
    run: async () => {
      await deleteTags.mutateAsync({ tagNames: [tag] })
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

const useDeleteTags = (): Action<TagName[]> => {
  const deleteTags = useRepositoryMutation(deleteTagsMutation)

  return {
    id: { key: 'tag_operation', operation: 'delete_tags' },
    blockedBy: [{ key: 'tag_operation' }],
    run: async (tags) => {
      await deleteTags.mutateAsync({ tagNames: tags })
    },
    derivedIds: (tags) =>
      tags.map((tag) => ({
        key: 'tag_operation',
        operation: 'delete_tag',
        tag,
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
