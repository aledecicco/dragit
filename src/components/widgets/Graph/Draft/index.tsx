import type { ComponentProps } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconFileCheck } from '@tabler/icons-react'
import { mergeRefs } from 'react-merge-refs'

import { NOT_STAGED_FILE_TYPES } from '@/widgets/WorktreeChanges/NotStaged'
import { STAGED_FILE_TYPES } from '@/widgets/WorktreeChanges/Staged'

import { useStageAll } from '@/api/mutations/addToIndex'
import { useCommitIndex } from '@/api/mutations/commitIndex'
import { useQueryWorktreeFiles } from '@/api/queries/worktreeFiles'
import { requestCommitParams } from '@/common/CommitDialog'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { Marquee } from '@/ui/Marquee'
import { Toolbar } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { pluralize } from '@/utils/string'
import { cn } from '@/utils/styles'

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

    const stagedChangesQuery = useQueryWorktreeFiles(STAGED_FILE_TYPES)
    const notStagedChangesQuery = useQueryWorktreeFiles(NOT_STAGED_FILE_TYPES)
    const hasStagedChanges = !!stagedChangesQuery.data?.items.length
    const hasNotStagedChanges = !!notStagedChangesQuery.data?.items.length

    const stageAll = useStageAll()
    const commit = useCommitIndex()

    return (
      <div {...divProps} ref={mergeRefs([trackRef, divProps.ref])}>
        <div
          className={'rounded-full shadow-sm p-0.5 bg-light-950/60'}
          style={{ width: NODE_SIZE, height: NODE_SIZE }}
        />

        <Draggable
          dragPayload={{
            type: 'worktree',
            label: pluralize(
              'staged file',
              stagedChangesQuery.data?.items.length ?? 0,
              true,
            ),
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
                      <Marquee
                        className={cn('text-xs text-light-600 p-1 mt-1')}
                        reverse={false}
                      >
                        {hasStagedChanges &&
                          pluralize(
                            'staged file',
                            stagedChangesQuery.data?.items.length ?? 0,
                            true,
                          )}
                        {hasStagedChanges && hasNotStagedChanges && ' • '}
                        {hasNotStagedChanges &&
                          pluralize(
                            'unstaged file',
                            notStagedChangesQuery.data?.items.length ?? 0,
                            true,
                          )}
                      </Marquee>

                      <Toolbar fixed className={cn('w-full')}>
                        <ToolbarItem
                          fixed
                          status="neutral"
                          size="sm"
                          compact={false}
                          action={stageAll}
                          className={cn('rounded-t-none rounded-b-xs')}
                        />

                        <ToolbarItem
                          fixed
                          status="neutral"
                          size="sm"
                          compact={false}
                          action={commit}
                          argsRequester={requestCommitParams}
                          className={cn('rounded-t-none rounded-b-xs')}
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
