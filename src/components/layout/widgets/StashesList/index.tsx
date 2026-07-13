import { type ComponentProps, useRef } from 'react'
import { IconArchive } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { StashInfo } from '@/api/models'
import { useQueryStashes } from '@/api/queries/stashes'
import {
  useGetStashesListInteractions,
  useStashAllInteraction,
  useStashFilesInteraction,
} from '@/interactions/stash'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { InteractiveBatch } from '@/lib/Interactive/Batch'
import { InteractiveSelection } from '@/lib/Interactive/Selection'
import { QueryList } from '@/lib/QueryList'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/storage'
import { Accordion } from '@/ui/Accordion'
import {
  AccordionSection,
  useAccordionSectionHandler,
} from '@/ui/Accordion/Section'
import { Chip } from '@/ui/Chip'
import { pluralize } from '@/utils/string'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { StashesListItem } from './Item'

interface StashesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the saved stashes in the current repository.
 */
const StashesList = (props: StashesListProps) => {
  const { ...divProps } = props

  const { stashesOpenByDefault } = useSettings()
  const accordionHandler = useAccordionSectionHandler({
    defaultOpen: stashesOpenByDefault,
  })

  const stashesQuery = useQueryStashes()
  const getInteractions = useGetStashesListInteractions()
  const stashFiles = useStashFilesInteraction()
  const stashAll = useStashAllInteraction()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusStashesShortcut, () => {
    accordionHandler.store.setOpen(true)
    ref.current?.focus()
  })

  return (
    <InteractiveBatch
      className={cn('border-none')}
      count={stashesQuery.data?.length}
      getInteractions={() => getInteractions(stashesQuery.data ?? [])}
      getDragPayload={() => getDragPayload(stashesQuery.data)}
    >
      <DropArea
        acceptedTypes={['not-staged-files', 'worktree']}
        label={{
          'not-staged-files': 'stash these changes',
          worktree: 'stash all changes',
        }}
        handleDrop={(payload) => {
          match(payload)
            .with({ type: 'not-staged-files' }, ({ dragged }) => {
              triggerInteraction(stashFiles(dragged))
            })
            .with({ type: 'worktree' }, () => {
              triggerInteraction(stashAll)
            })
            .exhaustive()
        }}
        overlayProps={{
          className: cn(!accordionHandler.isOpen && 'flex-row text-sm'),
        }}
        {...divProps}
      >
        <Accordion className={cn('max-h-full overflow-hidden')}>
          <AccordionSection
            store={accordionHandler.store}
            label="Stashes"
            extraInfo={
              <Chip size="sm">{stashesQuery.data?.length ?? '...'}</Chip>
            }
            contentProps={{
              className: cn('mb-2'),
            }}
          >
            <InteractiveSelection
              ref={ref}
              items={stashesQuery.data ?? []}
              getInteractions={getInteractions}
              getDragPayload={getDragPayload}
            >
              <QueryList
                name="stashes"
                emptyIcon={IconArchive}
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
            </InteractiveSelection>
          </AccordionSection>
        </Accordion>
      </DropArea>
    </InteractiveBatch>
  )
}

const getDragPayload = (stashes: StashInfo[] | undefined): DragPayload => ({
  type: 'stashes',
  dragged: stashes ?? [],
  label: pluralize('stash', stashes?.length ?? 0, true, 'stashes'),
  Glyph: IconArchive,
})

export { StashesList, type StashesListProps }
