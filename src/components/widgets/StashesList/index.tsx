import type { ComponentProps } from 'react'

import type { StashInfo } from '@api/models'
import { useApplyStash, useDiscardStash } from '@api/mutations'
import { useQueryStashes } from '@api/queries'
import { QueryList } from '@lib/QueryList'
import { IconPackageExport, IconTrash } from '@tabler/icons-react'
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
  const apply = useApplyStash()
  const discard = useDiscardStash()

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
          renderItem={(stash: StashInfo) => (
            <StashesListItem
              stash={stash}
              contextMenuItems={[
                {
                  label: 'Apply',
                  Glyph: IconPackageExport,
                  onClick: () => apply.mutateAsync({ stashId: stash.id }),
                },
                {
                  label: 'Discard',
                  Glyph: IconTrash,
                  onClick: () => discard.mutateAsync({ stashId: stash.id }),
                },
              ]}
            />
          )}
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
