import type { ComponentProps } from 'react'
import { IconTrashFilled } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import { useDeleteBranches } from '@/api/mutations/deleteBranches'
import { useDeleteTags } from '@/api/mutations/deleteTags'
import { useDiscardStashes } from '@/api/mutations/discardStashes'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { runAction } from '@/state/actions'
import { useSelectedBranches } from '@/state/branches'
import { cn } from '@/utils/styles'

interface RecyclingBinProps extends ComponentProps<'div'> {}

/**
 * Main app widget that serves as a drop target for deleting various items.
 */
const RecyclingBin = (props: RecyclingBinProps) => {
  const { ...divProps } = props

  const { currentBranch } = useSelectedBranches()

  const deleteBranches = useDeleteBranches()
  const deleteTags = useDeleteTags()
  const discardStashes = useDiscardStashes()

  return (
    <DropArea
      {...divProps}
      overlayProps={{
        className: cn('border-danger-400'),
      }}
      acceptedTypes={['branch', 'branches', 'stash', 'stashes', 'tag', 'tags']}
      label={{
        branch: 'delete this branch',
        branches: 'delete these branches',
        stash: 'discard this stash',
        stashes: 'discard these stashes',
        tag: 'delete this tag',
        tags: 'delete these tags',
      }}
      Glyph={IconTrashFilled}
      extraValidation={(payload) => {
        const isDraggingCurrentBranch =
          (payload.type === 'branch' &&
            payload.dragged.name === currentBranch?.name) ||
          (payload.type === 'branches' &&
            payload.dragged.some(
              (branch) => branch.name === currentBranch?.name,
            ))

        return !isDraggingCurrentBranch
      }}
      handleDrop={(payload) => {
        match(payload)
          .with({ type: 'branch' }, ({ dragged }) => {
            runAction(deleteBranches, [dragged])
          })
          .with({ type: 'branches' }, ({ dragged }) => {
            runAction(deleteBranches, dragged)
          })
          .with({ type: 'stash' }, ({ dragged }) => {
            runAction(discardStashes, [dragged])
          })
          .with({ type: 'stashes' }, ({ dragged }) => {
            runAction(discardStashes, dragged)
          })
          .with({ type: 'tag' }, ({ dragged }) => {
            runAction(deleteTags, [dragged])
          })
          .with({ type: 'tags' }, ({ dragged }) => {
            runAction(deleteTags, dragged)
          })
          .exhaustive()
      }}
    />
  )
}

export { RecyclingBin, type RecyclingBinProps }
