import type { ComponentProps } from 'react'
import { IconFile, IconFiles } from '@tabler/icons-react'

import type { WorktreeFileType } from '@/api/models'
import { useStageFiles } from '@/api/mutations/addToIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useStashFiles } from '@/api/mutations/saveStash'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
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

  const getActions = useGetActions()
  const stage = useStageFiles()

  return (
    <DropArea
      {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}
      acceptedTypes={['not-staged-files']}
      label={{
        'not-staged-files': 'stage changes',
      }}
      handleDrop={(payload) => {
        runAction(stage, payload.dragged)
      }}
    >
      <div
        className={cn(
          'text-sm text-light-600 text-start',
          'py-2 flex flex-row gap-x-2 items-center',
        )}
      >
        <p>Staged Changes</p>

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
        <MultiInteraction
          items={filesQuery.data?.items ?? []}
          getActions={getActions}
          getDragPayload={(files) => ({
            type: 'staged-files',
            dragged: files,
            label: files.length > 1 ? `${files.length} files` : files[0].path,
            Glyph: files.length > 1 ? IconFiles : IconFile,
          })}
        >
          <QueryList
            name="files with staged changes"
            query={filesQuery}
            getItems={(d) => d.items}
            renderItem={(file, position) => (
              <StagedChangesItem file={file} itemIndex={position} />
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
  )
}

const useGetActions = () => {
  const unstage = useUnstageFiles()
  const stash = useStashFiles()

  return () => {
    return [[unstage, stash]]
  }
}

export { StagedWorktreeChanges, type StagedWorktreeChangesProps }
