import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { useQueryBranches } from '@/api/queries/branches'
import { useQueryTags } from '@/api/queries/tags'
import { QueryList } from '@/lib/QueryList'
import { Chip } from '@/ui/Chip'
import { Tabs, useTabsHandler } from '@/ui/Tabs'
import { Tab } from '@/ui/Tabs/Item'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { BranchesListItem } from './BranchItem'
import { TagsListItem } from './TagItem'

interface BranchesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the list of branches in the current repository.
 */
const BranchesList = (props: BranchesListProps) => {
  const { ...divProps } = props

  const allBranchesQuery = useQueryBranches()
  const localBranchesQuery = useQueryBranches('local')
  const remoteBranchesQuery = useQueryBranches('remote')
  const tagsQuery = useQueryTags()

  const { store, selectedTab } = useTabsHandler('local', {
    selectOnMove: false,
  })

  const branchesQuery = match(selectedTab)
    .with('local', () => localBranchesQuery)
    .with('remote', () => remoteBranchesQuery)
    .otherwise(() => allBranchesQuery)

  return (
    <div {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}>
      <Tabs
        store={store}
        list={
          <>
            <Tab id="local">
              Local
              <Chip size="sm">{localBranchesQuery.data?.length ?? '...'}</Chip>
            </Tab>

            <Tab id="remote">
              Remote
              <Chip size="sm">{remoteBranchesQuery.data?.length ?? '...'}</Chip>
            </Tab>

            <Tab id="all">
              All
              <Chip size="sm">{allBranchesQuery.data?.length ?? '...'}</Chip>
            </Tab>

            <Tab id="tags" className={cn('ml-auto')}>
              Tags
              <Chip size="sm">{tagsQuery.data?.length ?? '...'}</Chip>
            </Tab>
          </>
        }
      />

      <div
        className={cn(
          'overflow-y-hidden grow',
          'w-full bg-dark-800 rounded-sm',
        )}
      >
        {selectedTab === 'tags' ? (
          <QueryList
            name="tags"
            query={tagsQuery}
            renderItem={(tag) => <TagsListItem tag={tag} />}
            size="sm"
            itemSize={74}
            options={mapFn(tagsQuery.data, (tags) => ({
              getItemKey: (index: number) => tags[index].name,
            }))}
          />
        ) : (
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
        )}
      </div>
    </div>
  )
}

export { BranchesList, type BranchesListProps }
