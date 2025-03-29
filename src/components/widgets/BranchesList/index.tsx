import * as Ariakit from '@ariakit/react'
import { type ComponentProps, useMemo } from 'react'

import { useQueryBranches } from '@api/queries'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { Accordion } from '@ui/Accordion'
import { AccordionSection } from '@ui/Accordion/Section'
import { cn, propsWithCn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { BranchesListItem } from './Item'

interface BranchesListProps extends ComponentProps<'div'> {}

const BranchesList = (props: BranchesListProps) => {
  const { ...divProps } = props

  const branchesQuery = useQueryBranches()

  const branchesOptions = useMemo(() => {
    return mapFn(branchesQuery.data, (branches) => ({
      getItemKey: (index: number) => branches[index].name,
    }))
  }, [branchesQuery.data])

  if (!branchesQuery.data) {
    return (
      <div
        {...propsWithCn(
          divProps,
          'h-full bg-dark-500',
          'flex flex-col items-center justify-center',
        )}
      >
        <p className={cn('text-sm italic text-light-950/60')}>
          Loading branches...
        </p>
      </div>
    )
  }

  return (
    <Accordion {...propsWithCn(divProps, 'overflow-hidden')}>
      <AccordionSection
        defaultOpen
        label={`All branches (${branchesQuery.data.length})`}
      >
        {branchesQuery.data.length ? (
          <Ariakit.CompositeProvider focusLoop>
            <Ariakit.Composite
              render={
                <VirtualizedDiv
                  size="sm"
                  items={branchesQuery.data}
                  itemSize={74}
                  RenderItem={BranchesListItem}
                  className={cn('w-full h-full')}
                  options={branchesOptions}
                />
              }
            />
          </Ariakit.CompositeProvider>
        ) : (
          <p className={cn('text-sm text-light-950')}>No branches found</p>
        )}
      </AccordionSection>
    </Accordion>
  )
}

export { BranchesList, type BranchesListProps }
