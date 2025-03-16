import * as Ariakit from '@ariakit/react'
import {
  IconDownload,
  IconGitBranch,
  IconLocationFilled,
  IconUpload,
} from '@tabler/icons-react'
import { type ComponentProps, memo } from 'react'
import { match } from 'ts-pattern'

import {
  useCheckoutLocalBranch,
  usePullBranch,
  usePushBranch,
} from '@api/commands'
import type { BranchInfo, BranchName, RefName } from '@api/models'
import { useSelectedBranches } from '@context/branches'
import { Icon } from '@ui/Icon'
import { Marquee } from '@ui/Marquee'
import { Toolbar } from '@ui/Toolbar'
import { getRemoteCounterpart } from '@utils/repository'
import { cn, propsWithCn } from '@utils/styles'
import { useDateDifference } from '@utils/time'

const BRANCHES_LIST_ITEM_ID = (name: BranchName | RefName) =>
  `branches_list_${name}` as const

interface BranchesListItemProps extends ComponentProps<'div'> {
  item: BranchInfo
}

const BranchesListItem = memo((props: BranchesListItemProps) => {
  const { item, ...divProps } = props
  const lastModified = useDateDifference(item.timestamp)

  const remoteCounterpart = getRemoteCounterpart(item)
  const pushBranch = usePushBranch()
  const pullBranch = usePullBranch()

  const { branch: currentBranch } = useSelectedBranches()
  const isCurrentBranch = currentBranch && item.name === currentBranch.name
  const checkout = useCheckoutLocalBranch()

  return (
    <Ariakit.CompositeItem
      id={BRANCHES_LIST_ITEM_ID(item.name)}
      render={
        <div
          aria-selected={isCurrentBranch}
          {...propsWithCn(
            divProps,
            'flex flex-row items-center justify-between gap-4',
            'p-1.5 bg-dark-600 rounded-xs',
            'hover:bg-dark-500 focus:bg-dark-500 data-focus:bg-dark-500',
            'border-1 border-solid border-transparent',
            'shadow-md',
            isCurrentBranch && 'bg-dark-500 border-accent-300',
          )}
          onClick={(e) => {
            if (e.detail === 0) {
              checkout.mutate(item.name)
            }

            divProps.onClick?.(e)
          }}
        />
      }
    >
      <div className={cn('overflow-x-hidden')}>
        <div
          className={cn('flex flex-row gap-x-1 items-center text-light-600')}
        >
          <Icon Glyph={IconGitBranch} size="md" />

          <Marquee className={cn('text-sm')}>{item.name}</Marquee>

          {isCurrentBranch && (
            <Icon
              Glyph={IconLocationFilled}
              size="sm"
              className={cn('text-accent-400/90')}
            />
          )}
        </div>

        <Marquee className={cn('text-xs text-light-950')}>
          {match(item.type)
            .with('local', () => 'Local branch')
            .with('remote', () => 'Remote branch')
            .exhaustive()}
          {remoteCounterpart && (
            <>
              , tracking{' '}
              <span className={cn('text-light-400')}>{remoteCounterpart}</span>
            </>
          )}
        </Marquee>
        <p className={cn('text-xs text-light-950/50 mt-2')}>
          Last modified {lastModified}
        </p>
      </div>

      {item.type === 'local' && (
        <Toolbar
          tools={[
            {
              Glyph: IconDownload,
              label: 'Pull',
              action: () => {
                pullBranch.mutate({
                  branch: item.name,
                  remote: item.remote?.remoteName ?? 'origin',
                  remoteBranch: item.remote?.branchName ?? item.name,
                  isRebase: false,
                })
              },
              disabled: pullBranch.isPending,
            },
            {
              Glyph: IconUpload,
              label: 'Push',
              action: () => {
                pushBranch.mutate({
                  branch: item.name,
                  remote: item.remote?.remoteName ?? 'origin',
                  remoteBranch: item.remote?.branchName ?? item.name,
                  isForce: false,
                })
              },
              disabled: pushBranch.isPending,
              alternatives: [
                {
                  Glyph: IconUpload,
                  label: 'Force push',
                  action: () => {
                    if (item?.type === 'local') {
                      pushBranch.mutate({
                        branch: item.name,
                        remote: item.remote?.remoteName ?? 'origin',
                        remoteBranch: item.remote?.branchName ?? item.name,
                        isForce: true,
                      })
                    }
                  },
                  disabled: pushBranch.isPending,
                },
              ],
            },
          ]}
          size="sm"
        />
      )}
    </Ariakit.CompositeItem>
  )
})

export { BranchesListItem, type BranchesListItemProps }
