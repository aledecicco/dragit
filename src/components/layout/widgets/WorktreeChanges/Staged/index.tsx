import { type ComponentProps, useRef } from 'react'
import { IconFiles } from '@tabler/icons-react'

import type { StagedFile, WorktreeFileType } from '@/api/models'
import { useStageFiles } from '@/api/mutations/addToIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useStashFiles } from '@/api/mutations/saveStash'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import {
  InteractiveListContainer,
  type ItemsInteraction,
} from '@/lib/Interactive/ListContainer'
import { InteractiveSelection } from '@/lib/Interactive/Selection'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import {
  setNextPage,
  setPrevPage,
  useHandleFilesPageSync,
  useWorktreeFilesPage,
} from '@/state/pages'
import { useSettings } from '@/state/settings'
import { Chip } from '@/ui/Chip'
import { pluralize } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { StagedChangesItem } from './Item'

export const STAGED_FILE_TYPES = [
  'staged',
] as const satisfies WorktreeFileType[]

interface StagedWorktreeChangesProps extends ComponentProps<'div'> {}

/**
 * Main app widget displaying the staged changes in the worktree.
 */
const StagedWorktreeChanges = (props: StagedWorktreeChangesProps) => {
  const { ...divProps } = props

  const filesQuery = useQueryWorktreeFiles(STAGED_FILE_TYPES)
  const page = useWorktreeFilesPage(STAGED_FILE_TYPES)
  useHandleFilesPageSync(STAGED_FILE_TYPES)

  const showPagination = useNeedsPagination(filesQuery, page)

  const getInteractions = useGetInteractions()
  const stage = useStageFiles()
  const unstage = useUnstageFiles()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusStagedShortcut, () => {
    ref.current?.focus()
  })

  return (
    <InteractiveListContainer
      className={cn('border-none group/drag')}
      items={filesQuery.data?.items ?? []}
      getInteractions={getInteractions}
      getDragPayload={getDragPayload}
    >
      <DropArea
        {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}
        acceptedTypes={['not-staged-files']}
        label={{
          'not-staged-files': 'stage changes',
        }}
        handleDrop={(payload) => {
          triggerInteraction({
            action: stage,
            argsRequester: () => payload.dragged,
          })
        }}
      >
        <div
          className={cn(
            'text-sm text-light-600 text-start',
            'py-2 flex flex-row gap-x-2 items-center',
          )}
        >
          <p
            className={cn(
              'select-none',
              'group-focus/drag:underline',
              'group-data-focus/drag:underline',
            )}
          >
            Staged Changes
          </p>

          {showPagination ? (
            <Pagination
              page={page}
              pageSize={WORKTREE_FILES_PAGE_SIZE}
              hasNext={!!filesQuery.data?.hasNext}
              setPrevPage={() => {
                setPrevPage(STAGED_FILE_TYPES)
              }}
              setNextPage={() => {
                setNextPage(STAGED_FILE_TYPES)
              }}
            />
          ) : (
            <Chip size="sm">{filesQuery.data?.items.length ?? '...'}</Chip>
          )}
        </div>

        <div
          className={cn(
            'overflow-y-hidden grow',
            'w-full bg-dark-800 rounded-sm',
          )}
        >
          <InteractiveSelection
            ref={ref}
            items={filesQuery.data?.items ?? []}
            getInteractions={getInteractions}
            getDragPayload={getDragPayload}
            deleteAction={(files) => {
              triggerInteraction({
                action: unstage,
                argsRequester: () => files,
              })
            }}
          >
            <QueryList
              name="files with staged changes"
              query={filesQuery}
              getItems={(d) => d.items}
              renderItem={(file, position) => (
                <StagedChangesItem file={file} itemIndex={position} />
              )}
              size="sm"
              itemSize={50}
              options={mapFn(filesQuery.data, (files) => ({
                getItemKey: (index: number) => files.items[index].path,
              }))}
            />
          </InteractiveSelection>
        </div>
      </DropArea>
    </InteractiveListContainer>
  )
}

const getDragPayload = (files: StagedFile[] | undefined): DragPayload => ({
  type: 'staged-files',
  dragged: files ?? [],
  label: pluralize('file', files?.length ?? 0, true),
  Glyph: IconFiles,
})

const useGetInteractions = () => {
  const unstage = useUnstageFiles()
  const stash = useStashFiles()

  return (): ItemsInteraction<StagedFile>[][] => {
    return [[{ action: unstage }, { action: stash }]]
  }
}

export { StagedWorktreeChanges, type StagedWorktreeChangesProps }
