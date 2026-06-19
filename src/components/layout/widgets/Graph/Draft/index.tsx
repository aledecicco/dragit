import type { ComponentProps } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconFileCheck } from '@tabler/icons-react'
import { mergeRefs } from 'react-merge-refs'

import { NOT_STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/NotStaged'
import { STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/Staged'

import {
  useQueryWorktreeFiles,
  WORKTREE_FILES_PAGE_SIZE,
} from '@/api/queries/worktreeFiles'
import {
  useCommitInteraction,
  useStageAllInteraction,
} from '@/interactions/operations'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { useWorktreeFilesPage } from '@/state/pages'
import { Marquee } from '@/ui/Marquee'
import { Toolbar } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { pluralize } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'

import { NODE_SIZE } from '../Commit/Node'
import { makeTracked } from '../SvgOverlay/utils'

const DRAFT_COMMIT_ID = 'commit_draft'

const COMMIT_WIDTH = 320
const COMMIT_HEIGHT = 66

interface DraftCommitProps extends ComponentProps<'div'> {
  /**
   * The id of the last commit.
   */
  parentId: string | undefined
}

/**
 * A draft commit that represents uncommitted worktree changes.
 *
 * Registers/unregisters itself in the SVG overlay when mounted/unmounted.
 */
const DraftCommit = (props: DraftCommitProps) => {
  const { parentId, ...divProps } = props

  return (
    <DraftCommitInner
      {...divProps}
      elementId={DRAFT_COMMIT_ID}
      parent={
        parentId
          ? {
              id: parentId,
              type: 'draft',
            }
          : undefined
      }
    />
  )
}

const DraftCommitInner = makeTracked<ComponentProps<'div'>, HTMLDivElement>(
  (props) => {
    const { trackRef, ...divProps } = props

    const stagedPage = useWorktreeFilesPage(STAGED_FILE_TYPES)
    const stagedChangesQuery = useQueryWorktreeFiles(STAGED_FILE_TYPES)
    const hasStagedChanges =
      stagedPage > 0 || !!stagedChangesQuery.data?.items.length
    const stagedCount =
      stagedPage * WORKTREE_FILES_PAGE_SIZE +
      (stagedChangesQuery.data?.items.length ?? 0)

    const notStagedPage = useWorktreeFilesPage(NOT_STAGED_FILE_TYPES)
    const notStagedChangesQuery = useQueryWorktreeFiles(NOT_STAGED_FILE_TYPES)
    const hasNotStagedChanges =
      notStagedPage > 0 || !!notStagedChangesQuery.data?.items.length
    const notStagedCount =
      notStagedPage * WORKTREE_FILES_PAGE_SIZE +
      (notStagedChangesQuery.data?.items.length ?? 0)

    const stageAll = useStageAllInteraction()
    const commit = useCommitInteraction()

    return (
      <div
        {...propsWithCn(divProps, 'select-none')}
        ref={mergeRefs([trackRef, divProps.ref])}
      >
        <div
          className={'rounded-full shadow-sm p-0.5 bg-light-950/60'}
          style={{ width: NODE_SIZE, height: NODE_SIZE }}
        />

        <Draggable
          dragPayload={{
            type: 'worktree',
            label: `${
              stagedChangesQuery.data?.hasNext || stagedChangesQuery.isFetching
                ? `${stagedCount}+`
                : stagedCount
            } ${pluralize('staged file', stagedCount, false)}`,
            Glyph: IconFileCheck,
            dragged: stagedChangesQuery.data?.items ?? [],
          }}
          className={cn(
            'absolute left-full top-half translate-x-2 -translate-y-half',
            'border-4 border-dark-600 rounded-lg shadow-md',
          )}
          style={{
            width: COMMIT_WIDTH * 0.75,
            height: COMMIT_HEIGHT * 1.1,
          }}
        >
          <div>
            <Ariakit.CompositeItem
              rowId="0"
              render={
                <div
                  className={cn(
                    'border border-dark-100 bg-dark-600 rounded-sm',
                    'w-full h-full',
                    'focus:bg-dark-500 focus:border-light-950/30',
                  )}
                >
                  <div
                    className={cn(
                      'w-full h-full overflow-hidden',
                      'flex flex-col gap-y-1 items-stretch',
                    )}
                  >
                    <div
                      className={cn(
                        'flex flex-col items-center justify-between w-full h-full',
                      )}
                    >
                      <div className={cn('w-full py-1 px-2')}>
                        <Marquee
                          className={cn('text-xs text-light-600 mt-1')}
                          reverse={false}
                        >
                          {hasStagedChanges && (
                            <span className={cn('text-success-300')}>
                              {stagedChangesQuery.data?.hasNext ||
                              stagedChangesQuery.isFetching
                                ? `${stagedCount}+`
                                : stagedCount}{' '}
                              {pluralize('staged file', stagedCount, false)}
                            </span>
                          )}
                          {hasStagedChanges && hasNotStagedChanges && ' • '}
                          {hasNotStagedChanges && (
                            <>
                              {notStagedChangesQuery.data?.hasNext ||
                              notStagedChangesQuery.isFetching
                                ? `${notStagedCount}+`
                                : notStagedCount}{' '}
                              {pluralize(
                                'not staged file',
                                notStagedCount,
                                false,
                              )}
                            </>
                          )}
                        </Marquee>
                      </div>

                      <Toolbar fixed className={cn('w-full')}>
                        <ToolbarItem
                          className={cn('rounded-t-none rounded-b-xs')}
                          status="neutral"
                          {...stageAll}
                          disabled={!hasNotStagedChanges}
                          size="sm"
                          compact={false}
                          fixed
                        />

                        <ToolbarItem
                          className={cn('rounded-t-none rounded-b-xs')}
                          status="neutral"
                          {...commit}
                          disabled={!hasStagedChanges}
                          size="sm"
                          compact={false}
                          fixed
                        />
                      </Toolbar>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </Draggable>
      </div>
    )
  },
)

export { DraftCommit, type DraftCommitProps }
