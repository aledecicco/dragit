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
import { Chip } from '@/ui/Chip'
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
import type { ElementId } from '../SvgOverlay/store'
import { makeTracked } from '../SvgOverlay/utils'

const DRAFT_COMMIT_ID = 'commit_draft'

const COMMIT_WIDTH = 320
const COMMIT_HEIGHT = 80

interface DraftCommitProps extends ComponentProps<'div'> {
  /**
   * The id of the last commit.
   */
  parentId: CommitId | undefined

  /**
   * Overrides the id the draft registers itself under.
   */
  elementId?: ElementId

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
  const { parentId, elementId, ...innerProps } = props

  return (
    <DraftCommitInner
      {...innerProps}
      elementId={elementId ?? DRAFT_COMMIT_ID}
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
        {...propsWithCn(divProps, 'select-none animate-enter-fade-in')}
        ref={mergeRefs([trackRef, divProps.ref])}
      >
        <div
          className={'rounded-full shadow-sm p-0.5 bg-light-300/60'}
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
            className={cn('size-full')}
          >
            <div>
              <Ariakit.CompositeItem
                rowId="0"
                render={
                  <div
                    className={cn(
                      'border border-dark-100 border-l-2 border-l-light-300',
                      'rounded-sm size-full',
                      'bg-dark-600',
                      'hover:bg-dark-500 data-active-item:bg-dark-500',
                      'hover:data-active-item:bg-dark-400',
                    )}
                  >
                    <div
                      className={cn(
                        'size-full overflow-hidden',
                        'flex flex-col items-stretch',
                      )}
                    >
                      <p
                        className={cn(
                          'py-1 px-2',
                          'uppercase text-2xs font-semibold tracking-widest text-light-600',
                        )}
                      >
                        Uncommitted changes
                      </p>
                      <div
                        className={cn(
                          'flex flex-col items-center justify-between size-full',
                        )}
                      >
                        <div
                          className={cn('w-full flex flex-row gap-x-1 px-2')}
                        >
                          {hasStagedChanges && (
                            <Chip size="xs" rounded={false} status="neutral">
                              {stagedCount.hasMore
                                ? `${stagedCount.count}+`
                                : `${stagedCount.count}`}{' '}
                              staged
                            </Chip>
                          )}
                          {hasNotStagedChanges && (
                            <Chip size="xs" rounded={false} status="neutral">
                              {notStagedCount.hasMore
                                ? `${notStagedCount.count}+`
                                : `${notStagedCount.count}`}{' '}
                              unstaged
                            </Chip>
                          )}
                        </div>

                        <Toolbar
                          fixed
                          className={cn('w-full grid grid-cols-[1fr_1.3fr]')}
                        >
                          <ToolbarItem
                            className={cn('rounded-t-none rounded-b-xs')}
                            status="neutral"
                            {...stageAll}
                            size="xs"
                            compact={false}
                            fixed
                          />

                          <ToolbarItem
                            className={cn('rounded-t-none rounded-b-xs')}
                            status="primary"
                            {...commit}
                            size="xs"
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
