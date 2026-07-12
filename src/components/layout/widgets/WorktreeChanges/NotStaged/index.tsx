import { type ComponentProps, useRef } from 'react'
import { IconFiles } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { NotStagedFile, WorktreeFileType } from '@/api/models'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
import {
  useDiscardAllNotStagedFilesInteraction,
  useDiscardFilesInteraction,
  useGetNotStagedFilesInteractions,
  useStageAllInteraction,
  useUnstageAllInteraction,
  useUnstageFilesInteraction,
} from '@/interactions/file'
import { useStashAllInteraction } from '@/interactions/stash'
import { group } from '@/lib/ActionButton/utils'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { InteractiveBatch } from '@/lib/Interactive/Batch'
import { InteractiveSelection } from '@/lib/Interactive/Selection'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { useSelectedFile } from '@/state/file'
import {
  setNextPage,
  setPrevPage,
  useHandleFilesPageSync,
  useWorktreeFilesPage,
} from '@/state/pages'
import { useSettings } from '@/state/storage'
import { Chip } from '@/ui/Chip'
import { useNotStagedCount } from '@/utils/repository'
import { pluralize } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { NotStagedChangesItem } from './Item'

export const NOT_STAGED_FILE_TYPES = [
  'unstaged',
  'untracked',
  'unmerged',
] as const satisfies WorktreeFileType[]

interface NotStagedWorktreeChangesProps extends ComponentProps<'div'> {}

/**
 * Main app widget displaying the not-staged changes in the worktree.
 */
const NotStagedWorktreeChanges = (props: NotStagedWorktreeChangesProps) => {
  const { ...divProps } = props

  const filesQuery = useQueryWorktreeFiles(NOT_STAGED_FILE_TYPES)
  const page = useWorktreeFilesPage(NOT_STAGED_FILE_TYPES)
  useHandleFilesPageSync(NOT_STAGED_FILE_TYPES)

  const showPagination = useNeedsPagination(filesQuery, page)

  const getInteractions = useGetNotStagedFilesInteractions()
  const unstageFiles = useUnstageFilesInteraction()
  const unstageAll = useUnstageAllInteraction()
  const stageAll = useStageAllInteraction()
  const discardFiles = useDiscardFilesInteraction()
  const discardAll = useDiscardAllNotStagedFilesInteraction()
  const stashAll = useStashAllInteraction()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusUnstagedShortcut, () => {
    ref.current?.focus()
  })

  const { count, hasMore } = useNotStagedCount()

  const currentFile = useSelectedFile()

  return (
    <InteractiveBatch
      className={cn('border-none group/drag')}
      count={count ? (hasMore ? `${count}+` : `${count}`) : undefined}
      getInteractions={() => [group(stageAll, stashAll), group(discardAll)]}
      getDragPayload={() => ({
        type: 'worktree',
        label: pluralize('unstaged file', count, true),
        Glyph: IconFiles,
        dragged: undefined,
      })}
    >
      <DropArea
        {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}
        acceptedTypes={['staged-files', 'index']}
        label={{
          'staged-files': 'unstage these changes',
          index: 'unstage all changes',
        }}
        handleDrop={(payload) => {
          match(payload)
            .with({ type: 'staged-files' }, ({ dragged }) => {
              triggerInteraction(unstageFiles(dragged))
            })
            .with({ type: 'index' }, () => {
              triggerInteraction(unstageAll)
            })
            .exhaustive()
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
            Unstaged Changes
          </p>

          {showPagination ? (
            <Pagination
              page={page}
              pageSize={WORKTREE_FILES_PAGE_SIZE}
              hasNext={!!filesQuery.data?.hasNext}
              setPrevPage={() => {
                setPrevPage(NOT_STAGED_FILE_TYPES)
              }}
              setNextPage={() => {
                setNextPage(NOT_STAGED_FILE_TYPES)
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
            onDelete={discardFiles}
          >
            <QueryList
              name="files with unstaged changes"
              query={filesQuery}
              getItems={(d) => d.items}
              renderItem={(file, position) => (
                <NotStagedChangesItem
                  file={file}
                  itemIndex={position}
                  aria-current={
                    file.path === currentFile?.path &&
                    file.status === currentFile.status
                  }
                />
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
    </InteractiveBatch>
  )
}

const getDragPayload = (files: NotStagedFile[] | undefined): DragPayload => ({
  type: 'not-staged-files',
  dragged: files ?? [],
  label: pluralize('file', files?.length ?? 0, true),
  Glyph: IconFiles,
})

export { NotStagedWorktreeChanges, type NotStagedWorktreeChangesProps }
