import type { ComponentProps } from 'react'
import { IconTrashFilled } from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import { useDeleteBranchesInteraction } from '@/interactions/branch'
import { useDiscardFilesInteraction } from '@/interactions/file'
import { useDiscardStashesInteraction } from '@/interactions/stash'
import { useDeleteTagsInteraction } from '@/interactions/tag'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { triggerInteraction } from '@/state/actions'
import { useCurrentBranch } from '@/utils/repository'
import { cn } from '@/utils/styles'

interface RecyclingBinProps extends ComponentProps<'div'> {}

/**
 * Main app widget that serves as a drop target for deleting various items.
 */
const RecyclingBin = (props: RecyclingBinProps) => {
  const { ...divProps } = props

  const currentBranch = useCurrentBranch()

  const deleteBranches = useDeleteBranchesInteraction()
  const discardStashes = useDiscardStashesInteraction()
  const deleteTags = useDeleteTagsInteraction()
  const discardFiles = useDiscardFilesInteraction()

  return (
    <DropArea
      {...divProps}
      overlayProps={{
        className: cn('border-danger-400'),
      }}
      acceptedTypes={[
        'branch',
        'branches',
        'stash',
        'stashes',
        'tag',
        'tags',
        'not-staged-files',
        'staged-files',
      ]}
      extraValidation={(payload) => {
        if (payload.type === 'branch' && currentBranch) {
          return payload.dragged.name !== currentBranch.name
        }

        if (payload.type === 'not-staged-files') {
          return !payload.dragged.some((file) => file.status === 'unmerged')
        }

        return true
      }}
      label={{
        branch: 'delete this branch',
        branches: 'delete these branches',
        stash: 'discard this stash',
        stashes: 'discard these stashes',
        tag: 'delete this tag',
        tags: 'delete these tags',
        'not-staged-files': 'discard changes in these files',
        'staged-files': 'discard changes in these files',
      }}
      Glyph={IconTrashFilled}
      handleDrop={(payload) => {
        match(payload)
          .with({ type: 'branch' }, ({ dragged }) => {
            triggerInteraction(deleteBranches([dragged]))
          })
          .with({ type: 'branches' }, ({ dragged }) => {
            triggerInteraction(deleteBranches(dragged))
          })
          .with({ type: 'stash' }, ({ dragged }) => {
            triggerInteraction(discardStashes([dragged]))
          })
          .with({ type: 'stashes' }, ({ dragged }) => {
            triggerInteraction(discardStashes(dragged))
          })
          .with({ type: 'tag' }, ({ dragged }) => {
            triggerInteraction(deleteTags([dragged]))
          })
          .with({ type: 'tags' }, ({ dragged }) => {
            triggerInteraction(deleteTags(dragged))
          })
          .with(
            { type: P.union('not-staged-files', 'staged-files') },
            ({ dragged }) => {
              triggerInteraction(discardFiles(dragged))
            },
          )
          .exhaustive()
      }}
    />
  )
}

export { RecyclingBin, type RecyclingBinProps }
