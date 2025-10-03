import { IconGitBranch, IconLocationFilled } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { BranchInfo } from '@/api/models'
import { usePullBranch } from '@/api/mutations'
import { useCheckoutBranch } from '@/api/mutations/checkoutLocal'
import { withContextMenu } from '@/lib/ContextMenu'
import { Icon } from '@/ui/Icon'
import { ListItem, type ListItemProps } from '@/ui/ListItem'
import { Marquee } from '@/ui/Marquee'
import { getRemoteCounterpart, useSelectedBranches } from '@/utils/repository'
import { cn, propsWithCn } from '@/utils/styles'
import { useDateDifference } from '@/utils/time'

interface BranchesListItemProps extends ListItemProps {
  branch: BranchInfo
}

/**
 * The list item for branches in the branches widget.
 *
 * Uses {@link Marquee}s to display long branch names.
 */
const BranchesListItem = withContextMenu<BranchesListItemProps>(
  (props) => {
    const { branch, ...itemProps } = props
    const lastModified = useDateDifference(branch.timestamp)

    const remoteCounterpart = getRemoteCounterpart(branch)

    const { branch: currentBranch } = useSelectedBranches()
    const isCurrentBranch = currentBranch && branch.name === currentBranch.name

    return (
      <ListItem
        aria-selected={isCurrentBranch}
        {...propsWithCn(
          itemProps,
          'border-1 border-solid border-transparent',
          isCurrentBranch && 'bg-dark-500 border-accent-300',
        )}
      >
        <div
          className={cn('flex flex-row gap-x-1 items-center text-light-600')}
        >
          <Icon Glyph={IconGitBranch} size="md" />

          <Marquee className={cn('text-sm')}>{branch.name}</Marquee>

          {isCurrentBranch && (
            <Icon
              Glyph={IconLocationFilled}
              size="sm"
              className={cn('text-accent-400/90')}
            />
          )}
        </div>

        <p
          className={cn(
            'text-xs text-light-950',
            'text-nowrap overflow-hidden text-ellipsis',
          )}
        >
          {match(branch.type)
            .with('local', () => 'Local branch')
            .with('remote', () => 'Remote branch')
            .exhaustive()}
          {remoteCounterpart && (
            <>
              , tracking{' '}
              <span className={cn('text-light-400')}>{remoteCounterpart}</span>
            </>
          )}
        </p>
        <p
          className={cn(
            'text-xs text-light-950/60 mt-2',
            'text-nowrap overflow-hidden text-ellipsis',
          )}
        >
          Last modified {lastModified}
        </p>
      </ListItem>
    )
  },
  ({ branch }) => {
    const checkout = useCheckoutBranch(branch)
    const pull = usePullBranch(branch)

    return [checkout, ...(branch.type === 'local' ? [pull] : [])]
  },
)

export { BranchesListItem, type BranchesListItemProps }
