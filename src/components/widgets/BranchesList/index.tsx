import type { ComponentProps } from 'react'

import { useQueryBranches } from '@/api/queries/branches'
import { QueryList } from '@/lib/QueryList'
import { Chip } from '@/ui/Chip'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { BranchesListItem } from './Item'

interface BranchesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the list of branches in the current repository.
 */
const BranchesList = (props: BranchesListProps) => {
  const { ...divProps } = props
  const branchesQuery = useQueryBranches()

  return (
    <div {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}>
      <div className={cn('flex flex-row items-center justify-between')}>
        <div
          className={cn(
            'text-sm text-light-600 text-start',
            'py-2 flex flex-row gap-x-2 items-center',
          )}
        >
          <p>All Branches</p>

          <Chip size="sm">{branchesQuery.data?.length ?? '...'}</Chip>
        </div>
      </div>

      <div
        className={cn(
          'overflow-y-hidden grow',
          'w-full bg-dark-800 rounded-sm',
        )}
      >
        <QueryList
          name="branches"
          query={branchesQuery}
          renderItem={(branch) => <BranchesListItem branch={branch} />}
          size="sm"
          itemSize={74}
          options={mapFn(branchesQuery.data, (branches) => ({
            getItemKey: (index: number) => branches[index].name,
          }))}
        />
      </div>
    </div>
  )
}

export { BranchesList, type BranchesListProps }
