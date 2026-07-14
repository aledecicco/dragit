import { IconTag } from '@tabler/icons-react'

import type { TagInfo } from '@/api/models'
import {
  useDeleteTagInteraction,
  useSingleTagInteractions,
} from '@/interactions/tag'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { InteractiveItem } from '@/lib/Interactive/Item'
import {
  MultiSelectItem,
  type MultiSelectItemProps,
} from '@/lib/MultiSelect/Item'
import { Chip } from '@/ui/Chip'
import { Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { cn } from '@/utils/styles'
import { useDateInfo } from '@/utils/time'

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

  const interactions = useSingleTagInteractions(tag)
  const deleteTag = useDeleteTagInteraction(tag.name)
  const taggedTime = useDateInfo(tag.timestamp)

  return (
    <Draggable
      dragPayload={{
        type: 'tag',
        dragged: tag.name,
        label: tag.name,
        Glyph: IconTag,
      }}
    >
      <InteractiveItem
        interactions={interactions}
        onDelete={deleteTag}
        render={<MultiSelectItem {...itemProps} />}
      >
        <div className={cn('flex flex-col justify-between')}>
          <div className={cn('min-w-0 w-full overflow-hidden')}>
            <div
              className={cn(
                'flex flex-row gap-x-1.5 items-center text-light-600',
              )}
            >
              <Icon Glyph={IconTag} size="md" />

              <Marquee className={cn('text-sm')} reverse={false}>
                {tag.name}
              </Marquee>

              <Chip
                size="xs"
                rounded={false}
                status="primary"
                className={cn('font-mono tracking-normal min-w-max')}
              >
                #{tag.reference}
              </Chip>
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
            {tag.authorName ? `${tag.authorName}, ` : 'Tagged '}
            {taggedTime}
          </Marquee>
        </div>
      </InteractiveItem>
    </Draggable>
  )
}

export { TagsListItem, type TagsListItemProps }
