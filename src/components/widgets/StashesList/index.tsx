import type { ComponentProps } from 'react'

import { useQueryStashes } from '@api/queries'
import { QueryList } from '@lib/QueryList'
import { Accordion } from '@ui/Accordion'
import { AccordionSection } from '@ui/Accordion/Section'
import { Chip } from '@ui/Chip'
import { propsWithCn } from '@utils/styles'
import { idFn, mapFn } from '@utils/types'
import { StashesListItem } from './Item'

interface StashesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the saved stashes in the current repository.
 */
const StashesList = (props: StashesListProps) => {
  const { ...divProps } = props

  const stashesQuery = useQueryStashes()

  const virtualizerOptions = mapFn(stashesQuery.data, (stashes) => ({
    getItemKey: (index: number) => stashes[index].id,
  }))

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
          query={stashesQuery}
          getItems={idFn}
          name="stashes"
          size="sm"
          itemSize={74}
          RenderItem={StashesListItem}
          options={virtualizerOptions}
        />
      </AccordionSection>
    </Accordion>
  )
}

export { StashesList, type StashesListProps }
