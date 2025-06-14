import type { ComponentProps } from 'react'

import type { StashInfo } from '@/api/models'
import { useQueryStashes } from '@/api/queries'
import { QueryList } from '@/lib/QueryList'
import { Accordion } from '@/ui/Accordion'
import { AccordionSection } from '@/ui/Accordion/Section'
import { Chip } from '@/ui/Chip'
import { propsWithCn } from '@/utils/styles'
import { idFn, mapFn } from '@/utils/types'

import { StashesListItem } from './Item'

interface StashesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the saved stashes in the current repository.
 */
const StashesList = (props: StashesListProps) => {
  const { ...divProps } = props
  const stashesQuery = useQueryStashes()

  return (
    <Accordion {...propsWithCn(divProps, 'overflow-hidden')}>
      <AccordionSection
        defaultOpen
        label="Stashes"
        extraInfo={mapFn(stashesQuery.data, (stashes) => (
          <Chip size="sm">{stashes.length}</Chip>
        ))}
      >
        <QueryList
          name="stashes"
          query={stashesQuery}
          getItems={idFn}
          renderItem={(stash: StashInfo) => <StashesListItem stash={stash} />}
          size="sm"
          itemSize={74}
          options={mapFn(stashesQuery.data, (stashes) => ({
            getItemKey: (index: number) => stashes[index].id,
          }))}
        />
      </AccordionSection>
    </Accordion>
  )
}

export { StashesList, type StashesListProps }
