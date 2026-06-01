import { type ComponentProps, useRef } from 'react'
import { IconFiles } from '@tabler/icons-react'

import type { NotStagedFile, WorktreeFileType } from '@/api/models'
import { useStageFiles } from '@/api/mutations/addToIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useDiscardChanges } from '@/api/mutations/restore'
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
import { requestStashParams } from '@/common/StashDialog'
import { interaction } from '@/lib/ActionButton/utils'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { InteractiveListContainer } from '@/lib/Interactive/ListContainer'
import { InteractiveSelection } from '@/lib/Interactive/Selection'
import { Pagination } from '@/lib/Pagination'
import { QueryList } from '@/lib/QueryList'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { type AnyInteraction, triggerInteraction } from '@/state/actions'
import {
  setNextPage,
  setPrevPage,
  useHandleFilesPageSync,
  useWorktreeFilesPage,
} from '@/state/pages'
import { getSettings, useSettings } from '@/state/storage'
import { Chip } from '@/ui/Chip'
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

  const getInteractions = useGetInteractions()
  const unstage = useUnstageFiles()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusUnstagedShortcut, () => {
    ref.current?.focus()
  })

  const discard = useDiscardChanges()

  return (
    <InteractiveListContainer
      className={cn('border-none group/drag')}
      items={filesQuery.data?.items ?? []}
      getInteractions={getInteractions}
      getDragPayload={getDragPayload}
    >
      <DropArea
        {...propsWithCn(divProps, 'flex flex-col gap-y-1 overflow-hidden')}
        acceptedTypes={['staged-files']}
        label={{
          'staged-files': 'unstage changes',
        }}
        handleDrop={(payload) => {
          triggerInteraction({
            action: unstage,
            argsRequester: () => payload.dragged,
          })
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
            deleteAction={(files) => {
              triggerInteraction({
                action: discard,
                argsRequester: () => files,
                isDangerous: true,
                details: `discard changes in ${pluralize('file', files.length, true)}`,
              })
            }}
          >
            <QueryList
              name="files with unstaged changes"
              query={filesQuery}
              getItems={(d) => d.items}
              renderItem={(file, position) => (
                <NotStagedChangesItem file={file} itemIndex={position} />
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
    </InteractiveListContainer>
  )
}

const getDragPayload = (files: NotStagedFile[] | undefined): DragPayload => ({
  type: 'not-staged-files',
  dragged: files ?? [],
  label: pluralize('file', files?.length ?? 0, true),
  Glyph: IconFiles,
})

const useGetInteractions = () => {
  const stage = useStageFiles()
  const stash = useStashFiles()

  const acceptAsIs = useAcceptManyAsIs()
  const acceptOurs = useAcceptManyOurs()
  const acceptTheirs = useAcceptManyTheirs()
  const acceptDeletions = useAcceptManyDeletions()
  const ignoreDeletions = useIgnoreManyDeletions()
  const acceptNewFiles = useAcceptManyFiles()
  const ignoreNewFiles = useIgnoreManyFiles()

  const discard = useDiscardChanges()

  return (files: NotStagedFile[]): AnyInteraction[][] => {
    const allBothAddedOrModified = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'bothAdded' || file.changes === 'bothModified'),
    )
    if (allBothAddedOrModified) {
      return [
        [
          interaction({ action: acceptAsIs, argsRequester: () => files }),
          interaction({ action: acceptOurs, argsRequester: () => files }),
          interaction({ action: acceptTheirs, argsRequester: () => files }),
        ],
      ]
    }

    const allAddedByUsOrThem = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'addedByUs' || file.changes === 'addedByThem'),
    )
    if (allAddedByUsOrThem) {
      return [
        [
          interaction({ action: acceptNewFiles, argsRequester: () => files }),
          interaction({ action: ignoreNewFiles, argsRequester: () => files }),
        ],
      ]
    }

    const allDeletedByUsOrThem = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'deletedByUs' || file.changes === 'deletedByThem'),
    )
    if (allDeletedByUsOrThem) {
      return [
        [
          interaction({ action: acceptDeletions, argsRequester: () => files }),
          interaction({ action: ignoreDeletions, argsRequester: () => files }),
        ],
      ]
    }

    const allDeleted = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'bothDeleted' ||
          file.changes === 'deletedByUs' ||
          file.changes === 'deletedByThem'),
    )
    if (allDeleted) {
      return [
        [interaction({ action: acceptDeletions, argsRequester: () => files })],
      ]
    }

    const anyUnmerged = files.some((file) => file.status === 'unmerged')
    if (anyUnmerged) {
      return [[interaction({ action: stage, argsRequester: () => files })]]
    }

    return [
      [
        interaction({ action: stage, argsRequester: () => files }),
        interaction({
          action: stash,
          argsRequester: async () => {
            const { askForStashMessage } = getSettings()
            const message = askForStashMessage
              ? (await requestStashParams()).message
              : null

            return { files, message }
          },
        }),
        interaction({
          action: discard,
          argsRequester: () => files,
          isDangerous: true,
          details: `discard changes in ${pluralize('file', files.length, true)}`,
        }),
      ],
    ]
  }
}

export { NotStagedWorktreeChanges, type NotStagedWorktreeChangesProps }
