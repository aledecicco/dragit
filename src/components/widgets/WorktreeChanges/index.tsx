import type { ComponentProps, ReactNode } from 'react'

import type { FileOfType } from '@/api/models'
import { useQueryWorktreeFiles, WORKTREE_FILES_PAGE_SIZE } from '@/api/queries'
import {
  type FileType,
  setNextPage,
  setPrevPage,
  useFilesPage,
} from '@/context/pages'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { Chip } from '@/ui/Chip'
import { useNeedsPagination } from '@/utils/pagination'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

interface WorktreeChangesProps<T extends FileType[]>
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
  renderFile: (file: FileOfType<T[number]>) => ReactNode
}

const WorktreeChanges = <T extends FileType[]>(
  props: WorktreeChangesProps<T>,
) => {
  const { label, fileTypes, extraInfo, renderFile, ...divProps } = props

  const filesQuery = useQueryWorktreeFiles<T[number]>(fileTypes)
  const page = useFilesPage(fileTypes)

  const showPagination = useNeedsPagination(filesQuery, page)

  return (
    <div
      {...propsWithCn(
        divProps,
        'flex flex-col gap-y-1 overflow-hidden min-h-50',
      )}
    >
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
      </div>
    </div>
  )
}

export { WorktreeChanges, type WorktreeChangesProps }
