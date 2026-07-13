import { type ComponentProps, useRef } from 'react'
import { IconFileCheck, IconFiles } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { StagedFile, WorktreeFileType } from '@/api/models'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
import {
  useDiscardAllStagedFilesInteraction,
  useGetStagedFilesInteractions,
  useStageAllInteraction,
  useStageFilesInteraction,
  useUnstageAllInteraction,
  useUnstageFilesInteraction,
} from '@/interactions/file'
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
import { useStagedCount } from '@/utils/repository'
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

  const getInteractions = useGetStagedFilesInteractions()
  const stageFiles = useStageFilesInteraction()
  const stageAll = useStageAllInteraction()
  const unstageFiles = useUnstageFilesInteraction()
  const unstageAll = useUnstageAllInteraction()
  const discardAll = useDiscardAllStagedFilesInteraction()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusStagedShortcut, () => {
    ref.current?.focus()
  })

  const { count, hasMore } = useStagedCount()

  const currentFile = useSelectedFile()

  return (
    <InteractiveBatch
      className={cn('border-none group/drag')}
      count={count ? (hasMore ? `${count}+` : `${count}`) : undefined}
      getInteractions={() => [group(unstageAll), group(discardAll)]}
      getDragPayload={() => ({
        type: 'index',
        label: pluralize('staged file', count, true),
        Glyph: IconFileCheck,
        dragged: { fromDraft: false },
      })}
    >
      <DropArea
        {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}
        acceptedTypes={['not-staged-files', 'worktree']}
        label={{
          'not-staged-files': 'stage these changes',
          worktree: 'stage all changes',
        }}
        handleDrop={(payload) => {
          match(payload)
            .with({ type: 'not-staged-files' }, ({ dragged }) => {
              triggerInteraction(stageFiles(dragged))
            })
            .with({ type: 'worktree' }, () => {
              triggerInteraction(stageAll)
            })
            .exhaustive()
        }}
      >
        <div
          className={cn(
            'text-sm text-light-800 text-start',
            'py-2 flex flex-row gap-x-2 items-center',
          )}
        >
          <p
            className={cn(
              'select-none uppercase text-2xs font-semibold tracking-widest',
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
            onDelete={unstageFiles}
          >
            <QueryList
              name="files with staged changes"
              emptyIcon={IconFileCheck}
              query={filesQuery}
              getItems={(d) => d.items}
              renderItem={(file, position) => (
                <StagedChangesItem
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

const getDragPayload = (files: StagedFile[] | undefined): DragPayload => ({
  type: 'staged-files',
  dragged: files ?? [],
  label: pluralize('file', files?.length ?? 0, true),
  Glyph: IconFiles,
})

export { StagedWorktreeChanges, type StagedWorktreeChangesProps }
