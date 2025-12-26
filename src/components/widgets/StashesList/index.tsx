import type { ComponentProps } from 'react'

import { useQueryStashes } from '@/api/queries/stashes'
import { QueryList } from '@/lib/QueryList'
import { Accordion } from '@/ui/Accordion'
import { AccordionSection } from '@/ui/Accordion/Section'
import { Chip } from '@/ui/Chip'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { StashesListItem } from './Item'

const STASHES_DEFAULT_OPEN = true // TODO: make configurable

interface StashesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the saved stashes in the current repository.
 */
const StashesList = (props: StashesListProps) => {
  const { ...divProps } = props
  const stashesQuery = useQueryStashes()

  return (
    <Accordion {...divProps}>
      <AccordionSection
        label="Stashes"
        extraInfo={<Chip size="sm">{stashesQuery.data?.length ?? '...'}</Chip>}
        defaultOpen={STASHES_DEFAULT_OPEN}
        className={cn('mb-2')}
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
      </AccordionSection>
    </Accordion>
  )
}

export { StashesList, type StashesListProps }
