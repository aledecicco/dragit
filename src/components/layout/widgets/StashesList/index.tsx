import { type ComponentProps, useRef } from 'react'
import { IconArchive } from '@tabler/icons-react'

import type { StashInfo } from '@/api/models'
import { useDiscardStashes } from '@/api/mutations/discardStashes'
import { useStashFiles } from '@/api/mutations/saveStash'
import { useQueryStashes } from '@/api/queries/stashes'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { MultiInteraction } from '@/lib/MultiInteraction'
import { QueryList } from '@/lib/QueryList'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/settings'
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
  const getStashesListActions = useGetStashesListActions()

  const stash = useStashFiles()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusStashesShortcut, () => {
    ref.current?.focus()
    accordionHandler.store.setOpen(true)
  })

  return (
    <Draggable
      className={cn('border-none')}
      dragPayload={getDragPayload(stashesQuery.data)}
    >
      <DropArea
        acceptedTypes={['staged-files', 'not-staged-files']}
        label={{
          'staged-files': 'stash changes',
          'not-staged-files': 'stash changes',
        }}
        handleDrop={(payload) => {
          triggerInteraction({
            action: stash,
            argsRequester: () => payload.dragged,
          })
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
            <MultiInteraction
              ref={ref}
              items={stashesQuery.data ?? []}
              getActions={getStashesListActions}
              getDragPayload={getDragPayload}
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
    </Draggable>
  )
}

const getDragPayload = (stashes: StashInfo[] | undefined): DragPayload => ({
  type: 'stashes',
  dragged: stashes ?? [],
  label: pluralize('stash', stashes?.length ?? 0, true, 'stashes'),
  Glyph: IconArchive,
})

const useGetStashesListActions = () => {
  const discard = useDiscardStashes()

  return () => [[discard]]
}

export { StashesList, type StashesListProps }
