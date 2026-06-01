import type { ComponentProps } from 'react'
import { IconTrashFilled } from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import { useDeleteBranches } from '@/api/mutations/deleteBranches'
import { useDeleteTags } from '@/api/mutations/deleteTags'
import { useDiscardStashes } from '@/api/mutations/discardStashes'
import { useDiscardChanges } from '@/api/mutations/restore'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { triggerInteraction } from '@/state/actions'
import { useCurrentBranch } from '@/utils/repository'
import { pluralize } from '@/utils/string'
import { cn } from '@/utils/styles'

interface RecyclingBinProps extends ComponentProps<'div'> {}

/**
 * Main app widget that serves as a drop target for deleting various items.
 */
const RecyclingBin = (props: RecyclingBinProps) => {
  const { ...divProps } = props

  const currentBranch = useCurrentBranch()

  const deleteBranches = useDeleteBranches()
  const deleteTags = useDeleteTags()
  const discardStashes = useDiscardStashes()
  const discardFiles = useDiscardChanges()

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
            triggerInteraction({
              action: deleteBranches,
              argsRequester: () => [dragged],
              isDangerous: true,
              details: `delete ${dragged.type} branch "${dragged.name}"`,
            })
          })
          .with({ type: 'branches' }, ({ dragged }) => {
            triggerInteraction({
              action: deleteBranches,
              argsRequester: () => dragged,
              isDangerous: true,
              details: `delete ${pluralize('branch', dragged.length, true, 'branches')}`,
            })
          })
          .with({ type: 'stash' }, ({ dragged }) => {
            triggerInteraction({
              action: discardStashes,
              argsRequester: () => [dragged],
              isDangerous: true,
              details: `discard stash #${dragged.id}`,
            })
          })
          .with({ type: 'stashes' }, ({ dragged }) => {
            triggerInteraction({
              action: discardStashes,
              argsRequester: () => dragged,
              isDangerous: true,
              details: `discard ${pluralize('stash', dragged.length, true, 'stashes')}`,
            })
          })
          .with({ type: 'tag' }, ({ dragged }) => {
            triggerInteraction({
              action: deleteTags,
              argsRequester: () => [dragged],
              isDangerous: true,
              details: `delete tag "${dragged.name}"`,
            })
          })
          .with({ type: 'tags' }, ({ dragged }) => {
            triggerInteraction({
              action: deleteTags,
              argsRequester: () => dragged,
              isDangerous: true,
              details: `delete ${pluralize('tag', dragged.length, true, 'tags')}`,
            })
          })
          .with(
            { type: P.union('not-staged-files', 'staged-files') },
            ({ dragged }) => {
              triggerInteraction({
                action: discardFiles,
                argsRequester: () => dragged,
                isDangerous: true,
                details: `discard changes in ${pluralize('file', dragged.length, true, 'files')}`,
              })
            },
          )
          .exhaustive()
      }}
    />
  )
}

export { RecyclingBin, type RecyclingBinProps }
