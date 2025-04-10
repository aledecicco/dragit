import * as Ariakit from '@ariakit/react'
import { type ComponentProps, useMemo } from 'react'

import { useQueryStashes } from '@api/queries'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { Accordion } from '@ui/Accordion'
import { AccordionSection } from '@ui/Accordion/Section'
import { Chip } from '@ui/Chip'
import { cn, propsWithCn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { StashesListItem } from './Item'

interface StashesListProps extends ComponentProps<'div'> {}

const StashesList = (props: StashesListProps) => {
  const { ...divProps } = props

  const stashesQuery = useQueryStashes()

  const virtualizerOptions = useMemo(() => {
    return mapFn(stashesQuery.data, (branches) => ({
      getItemKey: (index: number) => branches[index].name,
    }))
  }, [stashesQuery.data])

  if (!stashesQuery.data) {
    return (
      <div
        {...propsWithCn(
          divProps,
          'h-full bg-dark-500',
          'flex flex-col items-center justify-center',
        )}
      >
        <p className={cn('text-sm italic text-light-950/60')}>
          Loading stashes...
        </p>
      </div>
    )
  }

  return (
    <Accordion {...propsWithCn(divProps, 'overflow-hidden')}>
      <AccordionSection
        defaultOpen
        label="Stashes"
        extraInfo={<Chip size="sm">{stashesQuery.data.length}</Chip>}
      >
        {stashesQuery.data.length ? (
          <Ariakit.CompositeProvider focusLoop>
            <Ariakit.Composite
              render={
                <VirtualizedDiv
                  size="sm"
                  items={stashesQuery.data}
                  itemSize={74}
                  RenderItem={StashesListItem}
                  className={cn('w-full h-full')}
                  options={virtualizerOptions}
                />
              }
            />
          </Ariakit.CompositeProvider>
        ) : (
          <p className={cn('text-sm text-light-950/50 italic p-3')}>
            No stashes found
          </p>
        )}
      </AccordionSection>
    </Accordion>
  )
}

export { StashesList, type StashesListProps }
