import { startTransition, useDeferredValue, useState } from 'react'

import type { FileOfType, WorktreeFileType } from '@/api/models'
import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import { useNeedsPagination } from '@/api/utils'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import type { Shortcut } from '@/lib/ShortcutsCheatsheet'
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
  const { types, submitValue, ...commandMenuProps } = props

  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const filesQuery = useQueryWorktreeFiles(types, deferredSearch)
  useHandleFilesPageSync(types, deferredSearch)

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

        // TODO: should these be handled through the shortcuts system instead of manually here?
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
        startTransition(() => {
          commandMenuProps.onSearchChange?.(newSearch)
          setSearch(newSearch)
        })
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
        className={cn('px-0 bg-dark-700')}
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
