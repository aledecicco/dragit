import type { ComponentProps } from 'react'

import { useQueryStashes } from '@/api/queries/stashes'
import { QueryList } from '@/lib/QueryList'
import { Chip } from '@/ui/Chip'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { StashesListItem } from './Item'

interface StashesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the saved stashes in the current repository.
 */
const StashesList = (props: StashesListProps) => {
  const { ...divProps } = props
  const stashesQuery = useQueryStashes()

  return (
    <div {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}>
      <div className={cn('flex flex-row items-center justify-between')}>
        <div
          className={cn(
            'text-sm text-light-600 text-start',
            'py-2 flex flex-row gap-x-2 items-center',
          )}
        >
          <p>Stashes</p>

          <Chip size="sm">{stashesQuery.data?.length ?? '...'}</Chip>
        </div>
      </div>

      <div
        className={cn(
          'overflow-y-hidden grow',
          'w-full bg-dark-800 rounded-sm',
        )}
      >
        <QueryList
          name="stashes"
          query={stashesQuery}
          renderItem={(stash) => <StashesListItem stash={stash} />}
          size="sm"
          itemSize={74}
          options={mapFn(stashesQuery.data, (stashes) => ({
            getItemKey: (index: number) => stashes[index].tracker,
          }))}
        />
      </div>
    </div>
  )
}

export { StashesList, type StashesListProps }
