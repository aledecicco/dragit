import type { ComponentProps } from 'react'
import { IconArchive } from '@tabler/icons-react'

import { useDiscardStashes } from '@/api/mutations/discardStashes'
import { useStashFiles } from '@/api/mutations/saveStash'
import { useQueryStashes } from '@/api/queries/stashes'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { MultiInteraction } from '@/lib/MultiInteraction'
import { QueryList } from '@/lib/QueryList'
import { runAction } from '@/state/actions'
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
  const getStashesListActions = useGetStashesListActions()

  const stash = useStashFiles()

  return (
    <DropArea
      acceptedTypes={['staged-files', 'not-staged-files']}
      label={{
        'staged-files': 'stash changes',
        'not-staged-files': 'stash changes',
      }}
      handleDrop={(payload) => {
        runAction(stash, payload.dragged)
      }}
      {...divProps}
    >
      <Accordion>
        <AccordionSection
          label="Stashes"
          extraInfo={
            <Chip size="sm">{stashesQuery.data?.length ?? '...'}</Chip>
          }
          defaultOpen={STASHES_DEFAULT_OPEN}
          className={cn('mb-2')}
        >
          <MultiInteraction
            items={stashesQuery.data ?? []}
            getActions={getStashesListActions}
            getDragPayload={(_, stash) => ({
              type: 'stash',
              dragged: stash,
              label: `Stash #${stash.stashNumber}`,
              Glyph: IconArchive,
            })}
          >
            <QueryList
              name="stashes"
              query={stashesQuery}
              renderItem={(stash, position) => (
                <StashesListItem stash={stash} itemIndex={position} />
              )}
              size="sm"
              itemSize={74}
              options={mapFn(stashesQuery.data, (stashes) => ({
                getItemKey: (index: number) => stashes[index].tracker,
              }))}
            />
          </MultiInteraction>
        </AccordionSection>
      </Accordion>
    </DropArea>
  )
}

const useGetStashesListActions = () => {
  const discard = useDiscardStashes()

  return () => [[discard]]
}

export { StashesList, type StashesListProps }
