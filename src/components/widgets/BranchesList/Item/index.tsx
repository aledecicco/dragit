import * as Ariakit from '@ariakit/react'
import {
  IconDownload,
  IconGitBranch,
  IconLocationFilled,
  IconUpload,
} from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { usePullBranch, usePushBranch } from '@api/commands'
import type { BranchInfo, BranchName, RefName } from '@api/models'
import { useSelectedBranches } from '@context/branches'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { Marquee } from '@ui/Marquee'
import { Toolbar } from '@ui/Toolbar'
import { getRemoteCounterpart } from '@utils/repository'
import { cn, propsWithCn } from '@utils/styles'
import { useDateDifference } from '@utils/time'

const BRANCHES_LIST_ITEM_ID = (name: BranchName | RefName) =>
  `branches_list_${name}` as const

interface BranchesListItemProps extends ComponentProps<'div'> {
  branch: BranchInfo
}

const BranchesListItem = (props: BranchesListItemProps) => {
  const { branch, ...divProps } = props
  const lastModified = useDateDifference(branch.timestamp)

  const remoteCounterpart = getRemoteCounterpart(branch)
  const pushBranch = usePushBranch()
  const pullBranch = usePullBranch()

  const { branch: currentBranch } = useSelectedBranches()
  const isCurrentBranch = currentBranch && branch.name === currentBranch.name

  return (
    <Ariakit.CompositeItem
      id={BRANCHES_LIST_ITEM_ID(branch.name)}
      render={
        <div
          aria-selected={isCurrentBranch}
          {...propsWithCn(
            divProps,
            'flex flex-row items-center justify-between gap-4',
            'p-1.5 bg-dark-600 rounded-xs',
            'focus:bg-dark-500 data-focus:bg-dark-500',
            isCurrentBranch && 'bg-dark-500 border-1 border-accent-300',
          )}
        />
      }
    >
      <div className={cn('overflow-x-hidden')}>
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

        <p className={cn('text-xs text-light-950')}>
          {match(branch.type)
            .with('local', () => 'Local branch')
            .with('remote', () => 'Remote branch')
            .exhaustive()}
          {remoteCounterpart && (
            <>
              , tracking{' '}
              <Button
                variant="plain"
                size="sm"
                onClick={() => {
                  if (remoteCounterpart) {
                    document
                      .getElementById(BRANCHES_LIST_ITEM_ID(remoteCounterpart))
                      ?.focus()
                  }
                }}
                className={cn('inline p-0.5 text-light-400')}
                aria-label={`Jump to remote counterpart ${remoteCounterpart}`}
              >
                {remoteCounterpart}
              </Button>
            </>
          )}
        </p>
        <p className={cn('text-xs text-light-950/50 mt-2')}>
          Last modified {lastModified}
        </p>
      </div>

      {branch.type === 'local' && (
        <Toolbar
          tools={[
            {
              Glyph: IconDownload,
              label: 'Pull',
              action: () => {
                pullBranch.mutate({
                  branch: branch.name,
                  remote: branch.remote?.remoteName ?? 'origin',
                  remoteBranch: branch.remote?.branchName ?? branch.name,
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
                  branch: branch.name,
                  remote: branch.remote?.remoteName ?? 'origin',
                  remoteBranch: branch.remote?.branchName ?? branch.name,
                  isForce: false,
                })
              },
              disabled: pushBranch.isPending,
              alternatives: [
                {
                  Glyph: IconUpload,
                  label: 'Force push',
                  action: () => {
                    if (branch?.type === 'local') {
                      pushBranch.mutate({
                        branch: branch.name,
                        remote: branch.remote?.remoteName ?? 'origin',
                        remoteBranch: branch.remote?.branchName ?? branch.name,
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
}

export { BranchesListItem, type BranchesListItemProps }
