import { IconDownload, IconRefresh, IconUpload } from '@tabler/icons-react'
import clsx from 'clsx'

import { useFetchRemote, usePullBranch, usePushBranch } from '@api/commands'
import { useSelectedBranches } from '@context/branches'
import { Toolbar } from '@lib/Toolbar'

const BranchToolbars = () => {
  const pushBranch = usePushBranch()
  const pullBranch = usePullBranch()
  const fetchRemote = useFetchRemote()

  const { branch, baseBranch } = useSelectedBranches()

  return (
    <>
      <Toolbar
        className={clsx('col-start-1 row-start-2')}
        disabled={!branch || branch.type !== 'local'}
        tools={[
          {
            Glyph: IconDownload,
            label: 'Pull',
            action: () => {
              if (branch?.type === 'local') {
                pullBranch.mutate({
                  branch: branch.name,
                  remote: branch.remote?.remoteName ?? 'origin',
                  remoteBranch: branch.remote?.branchName ?? branch.name,
                  isRebase: false,
                })
              }
            },
            className: '[&]:w-17',
            disabled: pullBranch.isPending,
          },
          {
            Glyph: IconUpload,
            label: 'Push',
            action: () => {
              if (branch?.type === 'local') {
                pushBranch.mutate({
                  branch: branch.name,
                  remote: branch.remote?.remoteName ?? 'origin',
                  remoteBranch: branch.remote?.branchName ?? branch.name,
                  isForce: false,
                })
              }
            },
            className: '[&]:w-17',
            disabled: pushBranch.isPending,
          },
        ]}
      />

      <Toolbar
        className={clsx('col-start-2 row-start-2')}
        tools={[
          {
            Glyph: IconRefresh,
            label: 'Fetch all',
            action: () => {
              fetchRemote.mutate('--all')
            },
            className: '[&]:w-20',
            disabled: fetchRemote.isPending,
          },
        ]}
      />

      <Toolbar
        className={clsx('col-start-3 row-start-2')}
        disabled={!baseBranch || baseBranch.type !== 'local'}
        tools={[
          {
            Glyph: IconDownload,
            label: 'Pull',
            action: () => {
              if (baseBranch?.type === 'local') {
                pullBranch.mutate({
                  branch: baseBranch.name,
                  remote: baseBranch.remote?.remoteName ?? 'origin',
                  remoteBranch:
                    baseBranch.remote?.branchName ?? baseBranch.name,
                  isRebase: false,
                })
              }
            },
            className: '[&]:w-17',
            disabled: pullBranch.isPending,
          },
          {
            Glyph: IconUpload,
            label: 'Push',
            action: () => {
              if (baseBranch?.type === 'local') {
                pushBranch.mutate({
                  branch: baseBranch.name,
                  remote: baseBranch.remote?.remoteName ?? 'origin',
                  remoteBranch:
                    baseBranch.remote?.branchName ?? baseBranch.name,
                  isForce: false,
                })
              }
            },
            className: '[&]:w-17',
            disabled: pushBranch.isPending,
          },
        ]}
      />
    </>
  )
}

export { BranchToolbars }
