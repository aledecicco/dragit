import type { ComponentProps } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconFileCheck } from '@tabler/icons-react'
import { mergeRefs } from 'react-merge-refs'

import type { CommitId } from '@/api/models'
import {
  useStageAllInteraction,
  useUnstageAllInteraction,
} from '@/interactions/file'
import { useCommitInteraction } from '@/interactions/operations'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { InteractiveBatch } from '@/lib/Interactive/Batch'
import { triggerInteraction } from '@/state/actions'
import { Marquee } from '@/ui/Marquee'
import { Toolbar } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import {
  useHasNotStagedChanges,
  useHasStagedChanges,
  useNotStagedCount,
  useStagedCount,
} from '@/utils/repository'
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
  parentId: CommitId | undefined

  /**
   * The vertical offset the draft commit should be displayed at.
   */
  targetY: number
}

/**
 * A draft commit that represents uncommitted worktree changes.
 *
 * Registers/unregisters itself in the SVG overlay when mounted/unmounted.
 */
const DraftCommit = (props: DraftCommitProps) => {
  const { parentId, ...innerProps } = props

  return (
    <DraftCommitInner
      {...innerProps}
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

    const hasStagedChanges = useHasStagedChanges()
    const hasNotStagedChanges = useHasNotStagedChanges()
    const stagedCount = useStagedCount()
    const notStagedCount = useNotStagedCount()

    const stageAll = useStageAllInteraction()
    const unstageAll = useUnstageAllInteraction()
    const commit = useCommitInteraction()

    const commonStyles = {
      className: cn(
        'absolute left-full top-half translate-x-2 -translate-y-half',
        'border-4 border-dark-600 rounded-lg shadow-md',
      ),
      style: {
        width: COMMIT_WIDTH * 0.75,
        height: COMMIT_HEIGHT * 1.1,
      },
    }

    return (
      <div
        {...propsWithCn(divProps, 'select-none animate-node-fade-in')}
        ref={mergeRefs([trackRef, divProps.ref])}
      >
        <div
          className={'rounded-full shadow-sm p-0.5 bg-light-950/60'}
          style={{ width: NODE_SIZE, height: NODE_SIZE }}
        />

        <DropArea
          acceptedTypes={['index']}
          label={{
            index: 'commit changes',
          }}
          handleDrop={() => {
            triggerInteraction(commit)
          }}
          extraValidation={(payload) => {
            return !payload.dragged.fromDraft
          }}
          {...commonStyles}
          overlayProps={{
            className: cn('flex-row text-sm'),
          }}
        >
          <InteractiveBatch
            count={
              stagedCount.count
                ? stagedCount.hasMore
                  ? `${stagedCount.count}+`
                  : `${stagedCount.count}`
                : undefined
            }
            getInteractions={() => [[unstageAll]]}
            getDragPayload={() => ({
              type: 'index',
              label: pluralize('staged file', stagedCount.count, true),
              Glyph: IconFileCheck,
              dragged: { fromDraft: true },
            })}
            className={cn('w-full h-full')}
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
                                {stagedCount.hasMore
                                  ? `${stagedCount.count}+`
                                  : `${stagedCount.count}`}{' '}
                                {pluralize(
                                  'staged file',
                                  stagedCount.count,
                                  false,
                                )}
                              </span>
                            )}
                            {hasStagedChanges && hasNotStagedChanges && ' • '}
                            {hasNotStagedChanges && (
                              <span>
                                {notStagedCount.hasMore
                                  ? `${notStagedCount.count}+`
                                  : `${notStagedCount.count}`}{' '}
                                {pluralize(
                                  'unstaged file',
                                  notStagedCount.count,
                                  false,
                                )}
                              </span>
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
          </InteractiveBatch>
        </DropArea>
      </div>
    )
  },
)

export { DraftCommit, type DraftCommitProps }
