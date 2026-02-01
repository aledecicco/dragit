import type { ComponentProps, ReactNode } from 'react'

import type { FileOfType, WorktreeFileType } from '@/api/models'
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
import { MultiInteraction } from '@/lib/MultiInteraction'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import {
  setNextPage,
  setPrevPage,
  useHandleFilesPageSync,
  useWorktreeFilesPage,
} from '@/state/pages'
import { Chip } from '@/ui/Chip'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

interface WorktreeChangesProps<T extends WorktreeFileType[]>
  extends ComponentProps<'div'> {
  /**
   * The label for the section, displayed in the header.
   */
  label: string

  /**
   * Extra information to be displayed at the end of the header.
   */
  extraInfo?: ReactNode

  /**
   * The types of files to display in this list.
   */
  fileTypes: T

  /**
   * Callback to render each file item.
   */
  renderFile: (file: FileOfType<T[number]>, position: number) => ReactNode
}

/**
 * Main app widget that displays the list of worktree changes of specific types.
 */
const WorktreeChanges = <T extends WorktreeFileType[]>(
  props: WorktreeChangesProps<T>,
) => {
  const { label, fileTypes, extraInfo, renderFile, ...divProps } = props

  const filesQuery = useQueryWorktreeFiles<T[number]>(fileTypes)
  const page = useWorktreeFilesPage(fileTypes)
  useHandleFilesPageSync(fileTypes)

  const showPagination = useNeedsPagination(filesQuery, page)

  const getFilesListActions = useGetFilesListActions()

  return (
    <div {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}>
      <div className={cn('flex flex-row items-center justify-between')}>
        <div
          className={cn(
            'text-sm text-light-600 text-start',
            'py-2 flex flex-row gap-x-2 items-center',
          )}
        >
          <p className={cn('capitalize')}>{label}</p>

          {showPagination ? (
            <Pagination
              page={page}
              pageSize={WORKTREE_FILES_PAGE_SIZE}
              hasNext={!!filesQuery.data?.hasNext}
              setPrevPage={() => {
                setPrevPage(fileTypes)
              }}
              setNextPage={() => {
                setNextPage(fileTypes)
              }}
            />
          ) : (
            <Chip size="sm">{filesQuery.data?.items.length ?? '...'}</Chip>
          )}
        </div>

        {extraInfo}
      </div>

      <div
        className={cn(
          'overflow-y-hidden grow',
          'w-full bg-dark-800 rounded-sm',
        )}
      >
        <MultiInteraction
          items={filesQuery.data?.items ?? []}
          getActions={getFilesListActions}
        >
          <QueryList
            name={`files with ${label}`}
            query={filesQuery}
            getItems={(d) => d.items}
            renderItem={renderFile}
            size="sm"
            itemSize={48}
            options={mapFn(filesQuery.data, (files) => ({
              getItemKey: (index: number) => files.items[index].path,
            }))}
          />
        </MultiInteraction>
      </div>
    </div>
  )
}

const useGetFilesListActions = <T extends WorktreeFileType[]>() => {
  const unstage = useUnstageFiles()
  const stage = useStageFiles()
  const stash = useStashFiles()

  const acceptAsIs = useAcceptManyAsIs()
  const acceptOurs = useAcceptManyOurs()
  const acceptTheirs = useAcceptManyTheirs()
  const acceptDeletions = useAcceptManyDeletions()
  const ignoreDeletions = useIgnoreManyDeletions()
  const acceptNewFiles = useAcceptManyFiles()
  const ignoreNewFiles = useIgnoreManyFiles()

  return (files: FileOfType<T[number]>[]) => {
    const allStaged = files.every((file) => file.status === 'staged')
    if (allStaged) {
      return [[unstage, stash]]
    }

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

    const allNotStaged = files.every((file) => file.status !== 'staged')
    if (allNotStaged) {
      return [[stage, stash]]
    }

    return [[]]
  }
}

export { WorktreeChanges, type WorktreeChangesProps }
