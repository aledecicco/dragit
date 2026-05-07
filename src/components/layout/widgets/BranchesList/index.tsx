import { type ComponentProps, useRef } from 'react'
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
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { InteractiveListContainer } from '@/lib/Interactive/ListContainer'
import { InteractiveSelection } from '@/lib/Interactive/Selection'
import { QueryList } from '@/lib/QueryList'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/settings'
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

  const tabsHandler = useTabsHandler('local', {
    selectOnMove: false,
  })

  const currentBranchesQuery = match(tabsHandler.selectedTab)
    .with('local', () => localBranchesQuery)
    .with('remote', () => remoteBranchesQuery)
    .otherwise(() => allBranchesQuery)

  const getBranchesListActions = useGetBranchesListActions()
  const getTagsListActions = useGetTagsListActions()

  const makeTagCommit = useMakeTagCommit()
  const makeCreateBranchAt = useMakeCreateBranchAt()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusBranchesShortcut, () => {
    if (
      ref.current === document.activeElement ||
      ref.current?.contains(document.activeElement)
    ) {
      tabsHandler.store.setSelectedId(tabsHandler.store.next())
    } else {
      ref.current?.focus()
    }
  })

  const deleteBranches = useDeleteBranches()
  const deleteTags = useDeleteTags()

  return (
    <DropArea
      {...propsWithCn(
        divProps,
        'grid grid-rows-[max-content_1fr] gap-y-1 overflow-hidden',
      )}
      acceptedTypes={['commit']}
      label={
        tabsHandler.selectedTab === 'tags'
          ? {
              commit: 'tag this commit',
            }
          : {
              commit: 'track this commit',
            }
      }
      handleDrop={(payload) => {
        if (tabsHandler.selectedTab === 'tags') {
          triggerInteraction({
            action: makeTagCommit(payload.dragged),
            argsRequester: () =>
              requestTagParams(`#${payload.dragged.shortHash}`),
          })
        } else {
          triggerInteraction({
            action: makeCreateBranchAt(payload.dragged.id),
            argsRequester: () =>
              requestBranchName(`#${payload.dragged.shortHash}`),
          })
        }
      }}
    >
      <Tabs
        store={tabsHandler.store}
        list={
          <>
            <InteractiveListContainer
              className={cn('border-none')}
              items={localBranchesQuery.data ?? []}
              getActions={getBranchesListActions}
              getDragPayload={getBranchesDragPayload}
              onBeforeDrag={() => {
                tabsHandler.store.setSelectedId('local')
              }}
            >
              <Tab id="local">
                Local
                <Chip size="sm">
                  {localBranchesQuery.data?.length ?? '...'}
                </Chip>
              </Tab>
            </InteractiveListContainer>

            <InteractiveListContainer
              className={cn('border-none')}
              items={remoteBranchesQuery.data ?? []}
              getActions={getBranchesListActions}
              getDragPayload={getBranchesDragPayload}
              onBeforeDrag={() => {
                tabsHandler.store.setSelectedId('remote')
              }}
            >
              <Tab id="remote">
                Remote
                <Chip size="sm">
                  {remoteBranchesQuery.data?.length ?? '...'}
                </Chip>
              </Tab>
            </InteractiveListContainer>

            <InteractiveListContainer
              className={cn('border-none')}
              items={allBranchesQuery.data ?? []}
              getActions={getBranchesListActions}
              getDragPayload={getBranchesDragPayload}
              onBeforeDrag={() => {
                tabsHandler.store.setSelectedId('all')
              }}
            >
              <Tab id="all">
                All
                <Chip size="sm">{allBranchesQuery.data?.length ?? '...'}</Chip>
              </Tab>
            </InteractiveListContainer>

            <InteractiveListContainer
              className={cn('border-none')}
              items={tagsQuery.data ?? []}
              getActions={getTagsListActions}
              getDragPayload={getTagsDragPayload}
              onBeforeDrag={() => {
                tabsHandler.store.setSelectedId('tags')
              }}
            >
              <Tab id="tags" className={cn('ml-auto')}>
                Tags
                <Chip size="sm">{tagsQuery.data?.length ?? '...'}</Chip>
              </Tab>
            </InteractiveListContainer>
          </>
        }
      />

      <div
        className={cn(
          'overflow-y-hidden grow',
          'w-full bg-dark-800 rounded-sm',
        )}
      >
        {tabsHandler.selectedTab === 'tags' ? (
          <InteractiveSelection
            ref={ref}
            items={tagsQuery.data ?? []}
            getActions={getTagsListActions}
            getDragPayload={getTagsDragPayload}
            deleteAction={(tags) => {
              triggerInteraction({
                action: deleteTags,
                argsRequester: () => tags,
                isDangerous: true,
                details: `delete ${tags.length} tags`,
              })
            }}
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
          </InteractiveSelection>
        ) : (
          <InteractiveSelection
            ref={ref}
            items={currentBranchesQuery.data ?? []}
            getActions={getBranchesListActions}
            getDragPayload={getBranchesDragPayload}
            deleteAction={(branches) => {
              triggerInteraction({
                action: deleteBranches,
                argsRequester: () => branches,
                isDangerous: true,
                details: `delete ${branches.length} branches`,
              })
            }}
          >
            <QueryList
              name={match(tabsHandler.selectedTab)
                .with('local', () => 'local branches')
                .with('remote', () => 'remote branches')
                .otherwise(() => 'branches')}
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
          </InteractiveSelection>
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
