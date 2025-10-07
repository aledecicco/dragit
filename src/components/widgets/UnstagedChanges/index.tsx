import type { ComponentProps } from 'react'

import { FILE_STATUSES_PAGE_SIZE, useQueryFiles } from '@/api/queries'
import {
  type FileType,
  setNextPage,
  setPrevPage,
  useFilesPage,
  useNeedsPagination,
} from '@/context/pages'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { Chip } from '@/ui/Chip'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { UnstagedChangesItem } from './Item'

export const FILE_TYPES = [
  'unstaged',
  'untracked',
] as const satisfies FileType[]

interface UnstagedChangesProps extends ComponentProps<'div'> {}

const UnstagedChanges = (props: UnstagedChangesProps) => {
  const { ...divProps } = props

  const filesQuery = useQueryFiles(FILE_TYPES)
  const page = useFilesPage(FILE_TYPES)

  const showPagination = useNeedsPagination(filesQuery, page)

  return (
    <div {...propsWithCn(divProps, 'flex flex-col gap-y-1')}>
      <div
        className={cn(
          'text-sm text-light-600 text-start',
          'p-2 flex flex-row gap-x-2 items-center',
        )}
      >
        <p>Unstaged Changes</p>

        {showPagination ? (
          <Pagination
            page={page}
            pageSize={FILE_STATUSES_PAGE_SIZE}
            hasNext={!!filesQuery.data?.hasNext}
            setPrevPage={() => {
              setPrevPage(FILE_TYPES)
            }}
            setNextPage={() => {
              setNextPage(FILE_TYPES)
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
        <QueryList
          name="files with unstaged changes"
          query={filesQuery}
          getItems={(d) => d.items}
          renderItem={(file) => <UnstagedChangesItem file={file} />}
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

export { UnstagedChanges, type UnstagedChangesProps }
