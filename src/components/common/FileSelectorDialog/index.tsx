import { useState } from 'react'
import { useDebounce } from 'react-use'

import type { FileOfType, WorktreeFileType } from '@/api/models'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import type { Shortcut } from '@/lib/Shortcuts/Cheatsheet'
import { requestValueFromDialog } from '@/lib/ValueRequester/Dialog'
import {
  setNextPage,
  setPrevPage,
  useHandleFilesPageSync,
  useWorktreeFilesPage,
} from '@/state/pages'
import { CommandMenu, type CommandMenuProps } from '@/ui/CommandMenu'
import { cn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { FileSelectorDialogItem } from './Item'

interface FileSelectorDialogProps<T extends WorktreeFileType>
  extends Omit<CommandMenuProps, 'submitValue'> {
  /**
   * The types of files to match.
   */
  types: T | T[]

  /**
   * Callback to submit files.
   */
  submitValue: (args: FileOfType<T>[] | undefined) => void
}

const SHORTCUTS: Shortcut[] = [
  {
    sequence: ['Ctrl', 'Enter'],
    label: 'Use all matches',
  },
]

const PAGINATION_SHORTCUTS: Shortcut[] = [
  {
    sequence: ['Ctrl', 'Q'],
    label: 'Previous page',
  },
  {
    sequence: ['Ctrl', 'E'],
    label: 'Next page',
  },
]

/**
 * Dialog that allows the user to search for files matching a pathspec, and select one (or all) of them.
 */
const FileSelectorDialog = <T extends WorktreeFileType>(
  props: FileSelectorDialogProps<T>,
) => {
  const { types, submitValue, ...commandMenuProps } = props

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useDebounce(() => setDebouncedSearch(search), 150, [search])

  const filesQuery = useQueryWorktreeFiles(types, debouncedSearch)
  useHandleFilesPageSync(types, debouncedSearch)

  const page = useWorktreeFilesPage(types)
  const showPagination = useNeedsPagination(filesQuery, page)

  const shortcuts = showPagination
    ? [...SHORTCUTS, ...PAGINATION_SHORTCUTS]
    : SHORTCUTS

  return (
    <CommandMenu
      shortcuts={shortcuts}
      {...commandMenuProps}
      submitValue={(value) => {
        const file = filesQuery.data?.items.find(
          (file) => file.path === value?.selected,
        )

        submitValue(file ? [file] : undefined)
      }}
      onKeyDown={(e) => {
        commandMenuProps.onKeyDown?.(e)

        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          e.stopPropagation()

          submitValue(
            filesQuery.data?.items.length ? filesQuery.data.items : undefined,
          )
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
      fieldProps={{
        placeholder: 'Enter a pathspec...',
        ...commandMenuProps.fieldProps,
      }}
      onSearchChange={(newSearch) => {
        commandMenuProps.onSearchChange?.(`**${newSearch}**`)
        setSearch(`**${newSearch}**`)
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
      <QueryList
        name="matching files"
        size="sm"
        query={filesQuery}
        getItems={(page) => page.items}
        itemSize={52}
        className={cn('px-0')}
        renderItem={(file) => <FileSelectorDialogItem file={file} />}
        options={{
          paddingStart: 3,
          paddingEnd: 3,
          gap: 4,
          ...mapFn(filesQuery.data?.items, (items) => ({
            getItemKey: (index: number) => items[index].path,
          })),
        }}
      />
    </CommandMenu>
  )
}

const requestWorktreeFiles = <T extends WorktreeFileType[]>(types: T) =>
  requestValueFromDialog(FileSelectorDialog, { types })

export {
  FileSelectorDialog,
  requestWorktreeFiles,
  type FileSelectorDialogProps,
}
