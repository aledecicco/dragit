import * as Ariakit from '@ariakit/react'
import type { ComponentProps } from 'react'

import { branchesQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { Accordion } from '@ui/Accordion'
import { mapOr } from '@utils/array'
import { cn, propsWithCn } from '@utils/styles'
import { BranchesListItem } from './Item'

interface BranchesListProps extends ComponentProps<'div'> {}

const BranchesList = (props: BranchesListProps) => {
  const { ...divProps } = props

  const branches = useRepositoryQuery(branchesQuery)
  const composite = Ariakit.useCompositeStore({ focusLoop: true })

  if (!branches.data) {
    return (
      <div
        {...propsWithCn(
          divProps,
          'h-full bg-dark-600',
          'flex flex-col items-center justify-center',
        )}
      >
        <p className={cn('text-sm italic text-light-950')}>
          Loading branches...
        </p>
      </div>
    )
  }

  return (
    <Accordion
      {...propsWithCn(divProps, 'overflow-hidden')}
      showArrows
      sections={[
        {
          id: 'branches',
          label: <>All branches ({branches.data.length})</>,
          description: mapOr(
            <p className={cn('text-sm text-light-950')}>No branches found</p>,
            branches.data,
            (branch) => <BranchesListItem key={branch.name} branch={branch} />,
          ),
          render: (
            <Ariakit.Composite
              store={composite}
              render={
                <div className={cn('flex flex-col gap-2 p-2 min-h-30')} />
              }
            />
          ),
        },
      ]}
    />
  )
}

export { BranchesList, type BranchesListProps }
