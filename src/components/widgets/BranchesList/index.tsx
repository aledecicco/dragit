import type { ComponentProps } from 'react'
import { IconGitBranch, IconTags } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { BranchInfo, TagInfo } from '@/api/models'
import { useMakeCreateBranchAt } from '@/api/mutations/createBranch'
import { useMakeTagCommit } from '@/api/mutations/createTag'
import { useDeleteBranches } from '@/api/mutations/deleteBranches'
import { useDeleteTags } from '@/api/mutations/deleteTags'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryTags } from '@/api/queries/tags'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { requestTagParams } from '@/common/CreateTagDialog'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { MultiInteraction } from '@/lib/MultiInteraction'
import { QueryList } from '@/lib/QueryList'
import { prepareActionArgs, runAction } from '@/state/actions'
import { Chip } from '@/ui/Chip'
import { Tabs, useTabsHandler } from '@/ui/Tabs'
import { Tab } from '@/ui/Tabs/Item'
import { pluralize } from '@/utils/string'
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

  const currentBranchesQuery = match(selectedTab)
    .with('local', () => localBranchesQuery)
    .with('remote', () => remoteBranchesQuery)
    .otherwise(() => allBranchesQuery)

  const getBranchesListActions = useGetBranchesListActions()
  const getTagsListActions = useGetTagsListActions()

  const makeTagCommit = useMakeTagCommit()
  const makeCreateBranchAt = useMakeCreateBranchAt()

  return (
    <DropArea
      {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}
      acceptedTypes={['commit']}
      label={
        selectedTab === 'tags'
          ? {
              commit: 'tag this commit',
            }
          : {
              commit: 'track this commit',
            }
      }
      handleDrop={async (payload) => {
        if (selectedTab === 'tags') {
          const tagCommit = makeTagCommit(payload.dragged)
          const args = await prepareActionArgs(tagCommit, () =>
            requestTagParams(`#${payload.dragged.shortHash}`),
          )
          runAction(tagCommit, args)
        } else {
          const createBranchAt = makeCreateBranchAt(payload.dragged.id)
          const args = await prepareActionArgs(createBranchAt, () =>
            requestBranchName(`#${payload.dragged.shortHash}`),
          )
          runAction(createBranchAt, args)
        }
      }}
    >
      <Tabs
        store={store}
        list={
          <>
            <Draggable
              className={cn('border-none')}
              dragPayload={getBranchesDragPayload(localBranchesQuery.data)}
              onBeforeDrag={() => {
                store.setSelectedId('local')
              }}
            >
              <Tab id="local">
                Local
                <Chip size="sm">
                  {localBranchesQuery.data?.length ?? '...'}
                </Chip>
              </Tab>
            </Draggable>

            <Draggable
              className={cn('border-none')}
              dragPayload={getBranchesDragPayload(remoteBranchesQuery.data)}
              onBeforeDrag={() => {
                store.setSelectedId('remote')
              }}
            >
              <Tab id="remote">
                Remote
                <Chip size="sm">
                  {remoteBranchesQuery.data?.length ?? '...'}
                </Chip>
              </Tab>
            </Draggable>

            <Draggable
              className={cn('border-none')}
              dragPayload={getBranchesDragPayload(allBranchesQuery.data)}
              onBeforeDrag={() => {
                store.setSelectedId('all')
              }}
            >
              <Tab id="all">
                All
                <Chip size="sm">{allBranchesQuery.data?.length ?? '...'}</Chip>
              </Tab>
            </Draggable>

            <Draggable
              className={cn('border-none')}
              dragPayload={getTagsDragPayload(tagsQuery.data)}
              onBeforeDrag={() => {
                store.setSelectedId('tags')
              }}
            >
              <Tab id="tags" className={cn('ml-auto')}>
                Tags
                <Chip size="sm">{tagsQuery.data?.length ?? '...'}</Chip>
              </Tab>
            </Draggable>
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
          <MultiInteraction
            items={tagsQuery.data ?? []}
            getActions={getTagsListActions}
            getDragPayload={getTagsDragPayload}
          >
            <QueryList
              name="tags"
              query={tagsQuery}
              renderItem={(tag, position) => (
                <TagsListItem tag={tag} itemIndex={position} />
              )}
              size="sm"
              itemSize={74}
              options={mapFn(tagsQuery.data, (tags) => ({
                getItemKey: (index: number) => tags[index].name,
              }))}
            />
          </MultiInteraction>
        ) : (
          <MultiInteraction
            items={currentBranchesQuery.data ?? []}
            getActions={getBranchesListActions}
            getDragPayload={getBranchesDragPayload}
          >
            <QueryList
              name="branches"
              query={currentBranchesQuery}
              renderItem={(branch, position) => (
                <BranchesListItem branch={branch} itemIndex={position} />
              )}
              size="sm"
              itemSize={74}
              options={mapFn(currentBranchesQuery.data, (branches) => ({
                getItemKey: (index: number) => branches[index].name,
              }))}
            />
          </MultiInteraction>
        )}
      </div>
    </DropArea>
  )
}

const getBranchesDragPayload = (
  branches: BranchInfo[] | undefined,
): DragPayload => ({
  type: 'branches',
  dragged: branches ?? [],
  label: pluralize('branch', branches?.length ?? 0, true, 'branches'),
  Glyph: IconGitBranch,
})

const getTagsDragPayload = (tags: TagInfo[] | undefined): DragPayload => ({
  type: 'tags',
  dragged: tags ?? [],
  label: pluralize('tag', tags?.length ?? 0, true),
  Glyph: IconTags,
})

const useGetBranchesListActions = () => {
  const deleteBranches = useDeleteBranches()

  return () => [[deleteBranches]]
}

const useGetTagsListActions = () => {
  const deleteTags = useDeleteTags()

  return () => [[deleteTags]]
}

export { BranchesList, type BranchesListProps }
