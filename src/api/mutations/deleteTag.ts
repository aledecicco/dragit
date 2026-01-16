import { IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { TagInfo, TagName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface DeleteTagArgs {
  tagName: TagName
}

const deleteTagKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'delete_tag',
  }) as const

const deleteTagMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [deleteTagKey(repoPath)],
    mutationFn: (args: DeleteTagArgs) => {
      return invoke('delete_tag', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useDeleteTag = (tag: TagInfo): Action => {
  const deleteTag = useRepositoryMutation(deleteTagMutation)

  return {
    id: { key: 'tag_operation', operation: 'delete', tag: tag.name },
    blockedBy: [{ tag: tag.name }],
    run: async () => {
      await deleteTag.mutateAsync({ tagName: tag.name })
    },
    label: {
      idle: 'Delete',
      running: 'Deleting',
      success: 'Deleted',
      error: 'Failed',
    },
    Glyph: IconTrash,
  }
}

export { useDeleteTag, deleteTagKey, deleteTagMutation, type DeleteTagArgs }
