import * as Ariakit from '@ariakit/react'
import { IconDownload, IconGitBranch, IconUpload } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { usePullBranch, usePushBranch } from '@api/commands'
import type { BranchInfo, BranchName, RefName } from '@api/models'
import { Button } from '@lib/Button'
import { Icon } from '@lib/Icon'
import { Toolbar } from '@lib/Toolbar'
import { getRemoteCounterpart } from '@utils/repository'
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

  return (
    <Ariakit.CompositeItem
      render={
        <div
          {...divProps}
          id={BRANCHES_LIST_ITEM_ID(branch.name)}
          className={clsx(
            'flex flex-row items-center justify-between gap-4',
            'p-1.5 bg-dark-600 rounded-xs',
            divProps.className,
          )}
        />
      }
    >
      <div>
        <div
          className={clsx('flex flex-row gap-x-1 items-center text-light-600')}
        >
          <Icon Glyph={IconGitBranch} size="md" />

          <p
            className={clsx(
              'flex flex-row-reverse text-sm',
              'overflow-x-auto pb-2.5 -mb-2.5',
            )}
          >
            {branch.name}
          </p>
        </div>

        <p className={clsx('text-xs text-light-950')}>
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
                className={clsx('inline [&]:px-0.5 [&]:text-light-400')}
                aria-label={`Jump to remote counterpart ${remoteCounterpart}`}
              >
                {remoteCounterpart}
              </Button>
            </>
          )}
        </p>
        <p className={clsx('text-xs text-light-950/50 mt-2')}>
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
            },
          ]}
          size="sm"
        />
      )}
    </Ariakit.CompositeItem>
  )
}

export { BranchesListItem, type BranchesListItemProps }
