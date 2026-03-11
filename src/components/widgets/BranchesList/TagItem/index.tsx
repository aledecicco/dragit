import { IconGitCommit, IconTag } from '@tabler/icons-react'

import type { TagInfo } from '@/api/models'
import { useCheckoutTag } from '@/api/mutations/checkout'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useDeleteTag } from '@/api/mutations/deleteTags'
import { usePushTag } from '@/api/mutations/pushTag'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractionHandler } from '@/lib/InteractionHandler'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { cn } from '@/utils/styles'
import { useDateDifference } from '@/utils/time'

interface TagsListItemProps extends MultiSelectItemProps {
  /**
   * The tag that this list item should display.
   */
  tag: TagInfo
}

/**
 * The list item for tags in the branches widget.
 */
const TagsListItem = (props: TagsListItemProps) => {
  const { tag, ...itemProps } = props

  const interactions = useInteractions(tag)
  const taggedTime = useDateDifference(tag.timestamp)

  return (
    <Draggable
      dragPayload={{
        type: 'tag',
        dragged: tag,
        label: tag.name,
        Glyph: IconTag,
      }}
    >
      <InteractionHandler
        interactions={interactions}
        render={<MultiSelectItem {...itemProps} />}
      >
        <div
          className={cn('flex flex-col justify-between pointer-events-none')}
        >
          <div className={cn('min-w-0 w-full overflow-hidden')}>
            <div
              className={cn(
                'flex flex-row gap-x-1 items-center text-light-600',
              )}
            >
              <Icon Glyph={IconTag} size="md" />

              <Marquee className={cn('text-sm')} reverse={false}>
                {tag.name} -
                <span className={cn('text-light-950')}>
                  <Icon
                    Glyph={IconGitCommit}
                    size="sm"
                    className={cn('inline-block')}
                  />
                  {tag.reference}
                </span>
              </Marquee>
            </div>

            <Marquee
              className={cn('text-xs text-light-950', !tag.message && 'italic')}
              reverse={false}
            >
              {tag.message ?? 'No description'}
            </Marquee>
          </div>

          <Marquee
            className={cn('mt-2 text-xs text-light-950/60')}
            reverse={false}
          >
            {!!tag.authorName && `${tag.authorName}, `}
            {taggedTime}
          </Marquee>
        </div>
      </InteractionHandler>
    </Draggable>
  )
}

const useInteractions = (tag: TagInfo) => {
  const checkout = useCheckoutTag(tag)
  const push = usePushTag(tag)

  const createBranch = useCreateBranchAt(tag.name)
  const branchOff = useBranchOff(tag.name)
  const deleteTag = useDeleteTag(tag)

  return [
    group(interaction({ action: checkout }), interaction({ action: push })),
    group(
      interaction({
        action: createBranch,
        argsRequester: () => requestBranchName(`#${tag.reference}`),
      }),
      interaction({
        action: branchOff,
        argsRequester: () => requestBranchName(`#${tag.reference}`),
      }),
    ),
    group(interaction({ action: deleteTag, isDangerous: true })),
  ]
}

export { TagsListItem, type TagsListItemProps }
