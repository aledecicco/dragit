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
import { InteractiveBatch } from '@/lib/Interactive/Batch'
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
import { useQueryItems } from './utils'

interface BranchesListProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the list of branches in the current repository.
 */
const BranchesList = (props: BranchesListProps) => {
  const { ...divProps } = props

  const settings = useSettings()

  const allBranchesQuery = useQueryBranches()
  const allBranchesItems = useQueryItems(allBranchesQuery)
  const localBranchesQuery = useQueryBranches('local')
  const localBranchesItems = useQueryItems(localBranchesQuery)
  const remoteBranchesQuery = useQueryBranches('remote')
  const remoteBranchesItems = useQueryItems(remoteBranchesQuery)
  const tagsQuery = useQueryTags()
  const tagsItems = useQueryItems(tagsQuery)

  const tabsHandler = useTabsHandler('local', {
    selectOnMove: false,
  })

  const currentBranchesQuery = match(tabsHandler.selectedTab)
    .with('local', () => localBranchesQuery)
    .with('remote', () => remoteBranchesQuery)
    .otherwise(() => allBranchesQuery)
  const currentBranchesItems = match(tabsHandler.selectedTab)
    .with('local', () => localBranchesItems)
    .with('remote', () => remoteBranchesItems)
    .otherwise(() => allBranchesItems)

  const getBranchesListInteractions = useGetBranchesListInteractions()
  const getTagsListInteractions = useGetTagsListInteractions()
  const deleteBranches = useDeleteBranchesInteraction()
  const deleteTags = useDeleteTagsInteraction()

  const tagDroppedCommit = useTagSomeCommitInteraction()
  const tagDroppedBranch = useTagSomeBranchInteraction()
  const createBranchAtDroppedCommit = useCreateBranchAtSomeCommitInteraction()
  const createBranchAtDroppedBranch = useCreateBranchAtSomeBranchInteraction()

  const ref = useRef<HTMLDivElement>(null)
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
        'grid grid-rows-[max-content_1fr] overflow-hidden',
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
        className={cn('ml-0.5')}
        store={tabsHandler.store}
        list={
          <>
            <InteractiveBatch
              className={cn('border-none')}
              count={localBranchesItems?.length}
              getInteractions={() =>
                getBranchesListInteractions(localBranchesItems ?? [])
              }
              getDragPayload={() =>
                getBranchesDragPayload(localBranchesItems ?? [])
              }
              onBeforeDrag={() => {
                tabsHandler.store.setSelectedId('local')
              }}
            >
              <Tab id="local">
                Local
                <Chip size="sm">{localBranchesItems?.length ?? '...'}</Chip>
              </Tab>
            </InteractiveBatch>

            <InteractiveBatch
              className={cn('border-none')}
              count={remoteBranchesItems?.length}
              getInteractions={() =>
                getBranchesListInteractions(remoteBranchesItems ?? [])
              }
              getDragPayload={() =>
                getBranchesDragPayload(remoteBranchesItems ?? [])
              }
              onBeforeDrag={() => {
                tabsHandler.store.setSelectedId('remote')
              }}
            >
              <Tab id="remote">
                Remote
                <Chip size="sm">{remoteBranchesItems?.length ?? '...'}</Chip>
              </Tab>
            </InteractiveBatch>

            <InteractiveBatch
              className={cn('border-none')}
              count={allBranchesItems?.length}
              getInteractions={() =>
                getBranchesListInteractions(allBranchesItems ?? [])
              }
              getDragPayload={() =>
                getBranchesDragPayload(allBranchesItems ?? [])
              }
              onBeforeDrag={() => {
                tabsHandler.store.setSelectedId('all')
              }}
            >
              <Tab id="all">
                All
                <Chip size="sm">{allBranchesItems?.length ?? '...'}</Chip>
              </Tab>
            </InteractiveBatch>

            <InteractiveBatch
              className={cn('border-none')}
              count={tagsItems?.length}
              getInteractions={() => getTagsListInteractions(tagsItems ?? [])}
              getDragPayload={() => getTagsDragPayload(tagsItems ?? [])}
              onBeforeDrag={() => {
                tabsHandler.store.setSelectedId('tags')
              }}
            >
              <Tab id="tags" className={cn('ml-auto')}>
                Tags
                <Chip size="sm">{tagsItems?.length ?? '...'}</Chip>
              </Tab>
            </InteractiveBatch>
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
            items={tagsItems ?? []}
            getInteractions={getTagsListInteractions}
            getDragPayload={getTagsDragPayload}
            onDelete={(tags) => deleteTags(tags.map((tag) => tag.name))}
          >
            <QueryList
              name="tags"
              emptyIcon={IconTags}
              query={tagsQuery}
              getItems={() => tagsItems ?? []}
              renderItem={(tag, position) => (
                <TagsListItem tag={tag} itemIndex={position} />
              )}
              size="sm"
              itemSize={74}
              options={mapFn(tagsItems, (tags) => ({
                getItemKey: (index: number) => tags[index].name,
              }))}
            />
          </InteractiveSelection>
        ) : (
          <InteractiveSelection
            ref={ref}
            items={currentBranchesItems ?? []}
            getInteractions={getBranchesListInteractions}
            getDragPayload={getBranchesDragPayload}
            onDelete={(branches) =>
              deleteBranches(branches.map((branch) => branch.name))
            }
          >
            <QueryList
              name={match(tabsHandler.selectedTab)
                .with('local', () => 'local branches')
                .with('remote', () => 'remote branches')
                .otherwise(() => 'branches')}
              emptyIcon={IconGitBranch}
              query={currentBranchesQuery}
              getItems={() => currentBranchesItems ?? []}
              renderItem={(branch, position) => (
                <BranchesListItem branch={branch} itemIndex={position} />
              )}
              size="sm"
              itemSize={80}
              options={mapFn(currentBranchesItems, (branches) => ({
                getItemKey: (index: number) => branches[index].name,
              }))}
            />
          </InteractiveSelection>
        )}
      </div>
    </DropArea>
  )
}

const getBranchesDragPayload = (branches: BranchInfo[]): DragPayload => ({
  type: 'branches',
  dragged: branches.map((branch) => branch.name),
  label: pluralize('branch', branches.length, true, 'branches'),
  Glyph: IconGitBranch,
})

const getTagsDragPayload = (tags: TagInfo[]): DragPayload => ({
  type: 'tags',
  dragged: tags.map((tag) => tag.name),
  label: pluralize('tag', tags.length, true),
  Glyph: IconTags,
})

export { BranchesList, type BranchesListProps }
