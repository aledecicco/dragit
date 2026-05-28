import { type ComponentProps, useRef } from 'react'
import { IconArchive } from '@tabler/icons-react'

import type { StashInfo } from '@/api/models'
import { useDiscardStashes } from '@/api/mutations/discardStashes'
import { useStashFiles } from '@/api/mutations/saveStash'
import { useQueryStashes } from '@/api/queries/stashes'
import { requestStashParams } from '@/common/StashDialog'
import { interaction } from '@/lib/ActionButton/utils'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { InteractiveListContainer } from '@/lib/Interactive/ListContainer'
import { InteractiveSelection } from '@/lib/Interactive/Selection'
import { QueryList } from '@/lib/QueryList'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { type AnyInteraction, triggerInteraction } from '@/state/actions'
import { getSettings, useSettings } from '@/state/storage'
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
  const getInteractions = useGetInteractions()

  const stash = useStashFiles()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusStashesShortcut, () => {
    accordionHandler.store.setOpen(true)
    ref.current?.focus()
  })

  return (
    <InteractiveListContainer
      className={cn('border-none')}
      items={stashesQuery.data ?? []}
      getInteractions={getInteractions}
      getDragPayload={getDragPayload}
    >
      <DropArea
        acceptedTypes={['not-staged-files']}
        label={{
          'not-staged-files': 'stash changes',
        }}
        handleDrop={(payload) => {
          triggerInteraction({
            action: stash,
            argsRequester: async () => {
              const files = payload.dragged

              const { askForStashMessage } = getSettings()
              const message = askForStashMessage
                ? (await requestStashParams()).message
                : null

              return { files, message }
            },
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
            <InteractiveSelection
              ref={ref}
              items={stashesQuery.data ?? []}
              getInteractions={getInteractions}
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
            </InteractiveSelection>
          </AccordionSection>
        </Accordion>
      </DropArea>
    </InteractiveListContainer>
  )
}

const getDragPayload = (stashes: StashInfo[] | undefined): DragPayload => ({
  type: 'stashes',
  dragged: stashes ?? [],
  label: pluralize('stash', stashes?.length ?? 0, true, 'stashes'),
  Glyph: IconArchive,
})

const useGetInteractions = () => {
  const discard = useDiscardStashes()

  return (stashes: StashInfo[]): AnyInteraction[][] => [
    [
      interaction({
        action: discard,
        argsRequester: () => stashes,
        isDangerous: true,
        details: `discard ${pluralize('stash', stashes.length, true, 'stashes')}`,
      }),
    ],
  ]
}

export { StashesList, type StashesListProps }
