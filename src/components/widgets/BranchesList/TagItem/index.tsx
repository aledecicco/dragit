import { IconGitCommit, IconTag } from '@tabler/icons-react'

import type { TagInfo } from '@/api/models'
import { useCheckoutTag } from '@/api/mutations/checkout'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useDeleteTag } from '@/api/mutations/deleteTag'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { interaction } from '@/lib/ActionButton/utils'
import { InteractionHandler } from '@/lib/InteractionHandler'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'
import { useDateDifference } from '@/utils/time'

interface TagsListItemProps extends ListItemProps {
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
    <InteractionHandler
      interactions={interactions}
      render={
        <ListItem
          interactive={false}
          {...propsWithCn(
            itemProps,
            'flex flex-col justify-between',
            'border border-transparent',
          )}
        />
      }
    >
      <div className={cn('min-w-0 w-full overflow-hidden')}>
        <div
          className={cn('flex flex-row gap-x-1 items-center text-light-600')}
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

      <Marquee className={cn('mt-2 text-xs text-light-950/60')} reverse={false}>
        {!!tag.authorName && `${tag.authorName}, `}
        {taggedTime}
      </Marquee>
    </InteractionHandler>
  )
}

const useInteractions = (tag: TagInfo) => {
  const checkout = useCheckoutTag(tag)

  const createBranch = useCreateBranchAt(tag.name)
  const branchOff = useBranchOff(tag.name)
  const deleteTag = useDeleteTag(tag)

  return [
    [
      interaction({ action: checkout }),
      interaction({
        action: createBranch,
        argsRequester: () => requestBranchName(tag.reference),
      }),
      interaction({
        action: branchOff,
        argsRequester: () => requestBranchName(tag.reference),
      }),
    ],
    [interaction({ action: deleteTag })],
  ]
}

export { TagsListItem, type TagsListItemProps }
