import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { ComponentProps } from 'react'

import { branchesQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { useSelectedBranches } from '@context/branches'
import { Accordion } from '@lib/Accordion'
import { mapOr } from '@utils/array'
import { BranchesListItem } from './Item'

interface BranchesListProps extends ComponentProps<'div'> {}

const BranchesList = (props: BranchesListProps) => {
  const { ...divProps } = props

  const { branch: currentBranch } = useSelectedBranches()
  const branches = useRepositoryQuery(branchesQuery)
  const composite = Ariakit.useCompositeStore({ focusLoop: true })

  if (!branches.data) {
    return (
      <div
        {...divProps}
        className={clsx(
          'h-full bg-dark-600',
          'flex flex-col items-center justify-center',
          divProps.className,
        )}
      >
        <p className={clsx('text-sm italic text-light-950')}>
          Loading branches...
        </p>
      </div>
    )
  }

  return (
    <Accordion
      {...divProps}
      showArrows
      className={clsx('overflow-hidden', divProps.className)}
      sections={[
        {
          id: 'branches',
          label: <>All branches ({branches.data.length})</>,
          description: mapOr(
            <p className={clsx('text-sm text-light-950')}>No branches found</p>,
            branches.data,
            (branch) => (
              <BranchesListItem
                key={branch.name}
                branch={branch}
                className={clsx(
                  branch &&
                    currentBranch &&
                    branch.name === currentBranch.name &&
                    '[&]:bg-dark-500 border-1 border-primary-400',
                )}
              />
            ),
          ),
          render: (
            <Ariakit.Composite
              store={composite}
              render={
                <div className={clsx('flex flex-col gap-2 p-2 min-h-30')} />
              }
            />
          ),
        },
      ]}
    />
  )
}

export { BranchesList, type BranchesListProps }
