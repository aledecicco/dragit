import * as Ariakit from '@ariakit/react'
import { type ComponentProps, useMemo } from 'react'

import { branchesQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { Accordion } from '@ui/Accordion'
import { AccordionSection } from '@ui/Accordion/Section'
import { cn, propsWithCn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { BranchesListItem } from './Item'

interface BranchesListProps extends ComponentProps<'div'> {}

const BranchesList = (props: BranchesListProps) => {
  const { ...divProps } = props

  const branches = useRepositoryQuery(branchesQuery)
  const composite = Ariakit.useCompositeStore({ focusLoop: true })

  const branchesOptions = useMemo(() => {
    return mapFn(branches.data, (branches) => ({
      getItemKey: (index: number) => branches[index].name,
    }))
  }, [branches.data])

  if (!branches.data) {
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
      <AccordionSection label={`All branches (${branches.data.length})`}>
        {branches.data.length ? (
          <Ariakit.Composite
            store={composite}
            render={
              <VirtualizedDiv
                size="sm"
                items={branches.data}
                itemSize={74}
                RenderItem={BranchesListItem}
                className={cn('w-full h-full')}
                options={branchesOptions}
              />
            }
          />
        ) : (
          <p className={cn('text-sm text-light-950')}>No branches found</p>
        )}
      </AccordionSection>
    </Accordion>
  )
}

export { BranchesList, type BranchesListProps }
