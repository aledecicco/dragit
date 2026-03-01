import type { ComponentProps } from 'react'
import { IconFiles } from '@tabler/icons-react'

import type { NotStagedFile, WorktreeFileType } from '@/api/models'
import { useStageFiles } from '@/api/mutations/addToIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useStashFiles } from '@/api/mutations/saveStash'
import {
  useAcceptManyAsIs,
  useAcceptManyDeletions,
  useAcceptManyFiles,
  useAcceptManyOurs,
  useAcceptManyTheirs,
  useIgnoreManyDeletions,
  useIgnoreManyFiles,
} from '@/api/mutations/solveFileConflicts'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { MultiInteraction } from '@/lib/MultiInteraction'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { runAction } from '@/state/actions'
import {
  setNextPage,
  setPrevPage,
  useHandleFilesPageSync,
  useWorktreeFilesPage,
} from '@/state/pages'
import { Chip } from '@/ui/Chip'
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

  const getActions = useGetActions()
  const unstage = useUnstageFiles()

  return (
    <Draggable
      className={cn('border-none')}
      dragPayload={{
        type: 'not-staged-files',
        dragged: filesQuery.data?.items ?? [],
        label: `${(filesQuery.data?.items ?? []).length} files`,
        Glyph: IconFiles,
      }}
    >
      <DropArea
        {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}
        acceptedTypes={['staged-files']}
        label={{
          'staged-files': 'unstage changes',
        }}
        handleDrop={(payload) => {
          runAction(unstage, payload.dragged)
        }}
      >
        <div
          className={cn(
            'text-sm text-light-600 text-start',
            'py-2 flex flex-row gap-x-2 items-center',
          )}
        >
          <p>Unstaged Changes</p>

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
          <MultiInteraction
            items={filesQuery.data?.items ?? []}
            getActions={getActions}
            getDragPayload={(files) => ({
              type: 'not-staged-files',
              dragged: files,
              label: `${files.length} files`,
              Glyph: IconFiles,
            })}
          >
            <QueryList
              name="files with unstaged changes"
              query={filesQuery}
              getItems={(d) => d.items}
              renderItem={(file, position) => (
                <NotStagedChangesItem file={file} itemIndex={position} />
              )}
              size="sm"
              itemSize={48}
              options={mapFn(filesQuery.data, (files) => ({
                getItemKey: (index: number) => files.items[index].path,
              }))}
            />
          </MultiInteraction>
        </div>
      </DropArea>
    </Draggable>
  )
}

const useGetActions = () => {
  const stage = useStageFiles()
  const stash = useStashFiles()

  const acceptAsIs = useAcceptManyAsIs()
  const acceptOurs = useAcceptManyOurs()
  const acceptTheirs = useAcceptManyTheirs()
  const acceptDeletions = useAcceptManyDeletions()
  const ignoreDeletions = useIgnoreManyDeletions()
  const acceptNewFiles = useAcceptManyFiles()
  const ignoreNewFiles = useIgnoreManyFiles()

  return (files: NotStagedFile[]) => {
    const allBothAddedOrModified = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'bothAdded' || file.changes === 'bothModified'),
    )
    if (allBothAddedOrModified) {
      return [[acceptAsIs, acceptOurs, acceptTheirs]]
    }

    const allAddedByUsOrThem = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'addedByUs' || file.changes === 'addedByThem'),
    )
    if (allAddedByUsOrThem) {
      return [[acceptNewFiles, ignoreNewFiles]]
    }

    const allDeletedByUsOrThem = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'deletedByUs' || file.changes === 'deletedByThem'),
    )
    if (allDeletedByUsOrThem) {
      return [[acceptDeletions, ignoreDeletions]]
    }

    const allDeleted = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'bothDeleted' ||
          file.changes === 'deletedByUs' ||
          file.changes === 'deletedByThem'),
    )
    if (allDeleted) {
      return [[acceptDeletions]]
    }

    const anyUnmerged = files.some((file) => file.status === 'unmerged')
    if (anyUnmerged) {
      return [[stage]]
    }

    return [[stage, stash]]
  }
}

export { NotStagedWorktreeChanges, type NotStagedWorktreeChangesProps }
