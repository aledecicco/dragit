import { type ComponentProps, useRef } from 'react'
import { IconGitBranch, IconTags } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { BranchInfo, TagInfo } from '@/api/models'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryTags } from '@/api/queries/tags'
import {
  useCreateBranchAtSomeBranchInteraction,
  useCreateBranchAtSomeCommitInteraction,
  useDeleteBranchesInteraction,
  useGetBranchesListInteractions,
} from '@/interactions/branch'
import {
  useDeleteTagsInteraction,
  useGetTagsListInteractions,
  useTagSomeBranchInteraction,
  useTagSomeCommitInteraction,
} from '@/interactions/tag'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { InteractiveListContainer } from '@/lib/Interactive/ListContainer'
import { InteractiveSelection } from '@/lib/Interactive/Selection'
import { QueryList } from '@/lib/QueryList'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/storage'
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

  const getBranchesListInteractions = useGetBranchesListInteractions()
  const getTagsListInteractions = useGetTagsListInteractions()
  const deleteBranches = useDeleteBranchesInteraction()
  const deleteTags = useDeleteTagsInteraction()

  const tagDroppedCommit = useTagSomeCommitInteraction()
  const tagDroppedBranch = useTagSomeBranchInteraction()
  const createBranchAtDroppedCommit = useCreateBranchAtSomeCommitInteraction()
  const createBranchAtDroppedBranch = useCreateBranchAtSomeBranchInteraction()

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

  return (
    <DropArea
      {...propsWithCn(
        divProps,
        'grid grid-rows-[max-content_1fr] gap-y-1 overflow-hidden',
      )}
      acceptedTypes={['commit', 'branch']}
      label={
        tabsHandler.selectedTab === 'tags'
          ? {
              commit: 'tag this commit',
              branch: 'tag this branch',
            }
          : {
              commit: 'track this commit',
              branch: 'track this branch',
            }
      }
      handleDrop={(payload) => {
        if (tabsHandler.selectedTab === 'tags') {
          match(payload)
            .with({ type: 'commit' }, ({ dragged }) => {
              triggerInteraction(tagDroppedCommit(dragged))
            })
            .with({ type: 'branch' }, ({ dragged }) => {
              triggerInteraction(tagDroppedBranch(dragged))
            })
            .exhaustive()
        } else {
          match(payload)
            .with({ type: 'commit' }, ({ dragged }) => {
              triggerInteraction(createBranchAtDroppedCommit(dragged))
            })
            .with({ type: 'branch' }, ({ dragged }) => {
              triggerInteraction(createBranchAtDroppedBranch(dragged))
            })
            .exhaustive()
        }
      }}
    >
      <Tabs
        store={tabsHandler.store}
        list={
          <>
            <InteractiveListContainer
              className={cn('border-none')}
              items={
                (settings.sortBranchesByDate
                  ? localBranchesQuery.data?.sort((a, b) => {
                      return b.timestamp - a.timestamp
                    })
                  : localBranchesQuery.data) ?? []
              }
              getInteractions={getBranchesListInteractions}
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
              items={
                (settings.sortBranchesByDate
                  ? remoteBranchesQuery.data?.sort((a, b) => {
                      return b.timestamp - a.timestamp
                    })
                  : remoteBranchesQuery.data) ?? []
              }
              getInteractions={getBranchesListInteractions}
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
              items={
                (settings.sortBranchesByDate
                  ? allBranchesQuery.data?.sort((a, b) => {
                      return b.timestamp - a.timestamp
                    })
                  : allBranchesQuery.data) ?? []
              }
              getInteractions={getBranchesListInteractions}
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
              items={
                (settings.sortBranchesByDate
                  ? tagsQuery.data?.sort((a, b) => {
                      return b.timestamp - a.timestamp
                    })
                  : tagsQuery.data) ?? []
              }
              getInteractions={getTagsListInteractions}
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
        key={tabsHandler.selectedTab}
        className={cn(
          'overflow-y-hidden grow',
          'w-full bg-dark-800 rounded-sm',
        )}
      >
        {tabsHandler.selectedTab === 'tags' ? (
          <InteractiveSelection
            ref={ref}
            items={tagsQuery.data ?? []}
            getInteractions={getTagsListInteractions}
            getDragPayload={getTagsDragPayload}
            deleteAction={(tags) => {
              triggerInteraction(deleteTags(tags))
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
            getInteractions={getBranchesListInteractions}
            getDragPayload={getBranchesDragPayload}
            deleteAction={(branches) => {
              triggerInteraction(deleteBranches(branches))
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

export { BranchesList, type BranchesListProps }
