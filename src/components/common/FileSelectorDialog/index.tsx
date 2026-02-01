import { useState } from 'react'

import type { WorktreeFileType } from '@/api/models'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
import { Pagination } from '@/lib/Pagination'
import type { Shortcut } from '@/lib/ShortcutsCheatsheet'
import { requestValueFromDialog } from '@/lib/ValueRequester/Dialog'
import { VirtualizedDiv } from '@/lib/VirtualizedDiv'
import {
  setNextPage,
  setPrevPage,
  useHandleFilesPageSync,
  useWorktreeFilesPage,
} from '@/state/pages'
import { CommandMenu, type CommandMenuProps } from '@/ui/CommandMenu'
import { CommandMenuItem } from '@/ui/CommandMenu/Item'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation } from '@/utils/string'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { FilePath } from '../File/Path'

interface FileSelectorDialogProps<T extends WorktreeFileType>
  extends CommandMenuProps {
  /**
   * The types of files to match.
   */
  types: T | T[]
}

const SHORTCUTS: Shortcut[] = [
  {
    keys: [
      { symbol: 'Ctrl', keyName: 'Control' }, // TODO: Mac key symbol
      { symbol: '↵', keyName: 'Enter' },
    ],
    combined: true,
    label: 'Use all matches',
  },
]

const PAGINATION_SHORTCUTS: Shortcut[] = [
  {
    keys: [
      { symbol: 'Ctrl', keyName: 'Control' }, // TODO: Mac key symbol
      { symbol: 'Q', keyName: 'q' },
    ],
    combined: true,
    label: 'Previous page',
  },
  {
    keys: [
      { symbol: 'Ctrl', keyName: 'Control' }, // TODO: Mac key symbol
      { symbol: 'E', keyName: 'e' },
    ],
    combined: true,
    label: 'Next page',
  },
]

/**
 * Dialog that allows the user to search for files matching a pathspec, and select one (or all) of them.
 */
const FileSelectorDialog = <T extends WorktreeFileType>(
  props: FileSelectorDialogProps<T>,
) => {
  const { types, ...commandMenuProps } = props

  const [search, setSearch] = useState('')
  const filesQuery = useQueryWorktreeFiles(types, search)
  useHandleFilesPageSync(types, search)

  const page = useWorktreeFilesPage(types)
  const showPagination = useNeedsPagination(filesQuery, page)

  const shortcuts = showPagination
    ? [...SHORTCUTS, ...PAGINATION_SHORTCUTS]
    : SHORTCUTS

  return (
    <CommandMenu
      shortcuts={shortcuts}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          e.stopPropagation()
          commandMenuProps.submitValue({
            value: search.length ? search : '.',
          })
        }

        if ((e.key === 'q' || e.key === 'Q') && (e.ctrlKey || e.metaKey)) {
          setPrevPage(types)
        }

        if ((e.key === 'e' || e.key === 'E') && (e.ctrlKey || e.metaKey)) {
          if (filesQuery.data?.hasNext) {
            setNextPage(types)
          }
        }
      }}
      {...commandMenuProps}
      fieldProps={{
        placeholder: 'Enter a pathspec...',
        ...commandMenuProps.fieldProps,
      }}
      onSearchChange={(newSearch) => {
        commandMenuProps.onSearchChange?.(newSearch)
        setSearch(newSearch)
      }}
      footer={
        showPagination && (
          <Pagination
            page={page}
            pageSize={WORKTREE_FILES_PAGE_SIZE}
            hasNext={!!filesQuery.data?.hasNext}
            setPrevPage={() => {
              setPrevPage(types)
            }}
            setNextPage={() => {
              setNextPage(types)
            }}
            buttonProps={{
              variant: 'plain',
            }}
          />
        )
      }
    >
      <VirtualizedDiv
        size="sm"
        items={filesQuery.data?.items}
        itemSize={52}
        className={cn('px-0')}
        itemProps={{
          className: cn('border-b border-b-dark-50 last:border-0'),
        }}
        renderItem={(file) => {
          const { filedir, filename } = getPathLocation(file.path)

          return (
            <CommandMenuItem
              value={file.path}
              className={cn('flex flex-col items-start')}
            >
              <Marquee className={cn('text-sm text-light-500')}>
                {filename}
              </Marquee>

              <Marquee className={cn('text-xs text-light-900/80')}>
                <FilePath
                  filepath={filedir}
                  separatorProps={{ className: cn('text-light-700') }}
                />
              </Marquee>
            </CommandMenuItem>
          )
        }}
        options={mapFn(filesQuery.data?.items, (items) => ({
          getItemKey: (index: number) => items[index].path,
          gap: 0,
          paddingStart: 0,
          paddingEnd: 0,
        }))}
        fallback={
          <div
            className={cn('p-3 text-center', 'text-sm italic text-light-950')}
          >
            {filesQuery.data?.items === undefined
              ? 'Loading matches.'
              : 'No matches found.'}
          </div>
        }
      />
    </CommandMenu>
  )
}

const requestFilePath = <T extends WorktreeFileType[]>(types: T) =>
  requestValueFromDialog(FileSelectorDialog, { types }).then(
    ({ value }) => value,
  )

export { FileSelectorDialog, type FileSelectorDialogProps, requestFilePath }
