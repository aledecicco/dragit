import { useMemo } from 'react'

import type { BranchInfo } from '@api/models'
import { usePullBranch, usePushBranch } from '@api/mutations'
import { askForValue } from '@lib/AskForValueDialog'
import { IconDownload, IconUpload } from '@tabler/icons-react'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface BranchToolbarProps extends Partial<ToolbarProps> {
  branch: BranchInfo | undefined
}

const BranchToolbar = (props: BranchToolbarProps) => {
  const { branch, ...toolbarProps } = props

  const pull = usePullBranch()
  const push = usePushBranch()

  const tools = useMemo(() => {
    return [
      {
        Glyph: IconDownload,
        label: 'Pull',
        action: async () => {
          if (branch?.type === 'local') {
            pull.mutate({
              branch: branch.name,
              remote:
                branch.remote?.remoteName ??
                (await askForValue({
                  defaultValue: 'origin',
                  Message: 'Choose a remote to pull from',
                  label: 'Remote Name',
                })),
              remoteBranch: branch.remote?.branchName ?? branch.name,
              isRebase: false,
            })
          }
        },
        disabled: pull.isPending,
      },
      {
        Glyph: IconUpload,
        label: 'Push',
        action: () => {
          if (branch?.type === 'local') {
            push.mutate({
              branch: branch.name,
              remote: branch.remote?.remoteName ?? 'origin',
              remoteBranch: branch.remote?.branchName ?? branch.name,
              isForce: false,
              setUpstream: !branch.remote,
            })
          }
        },
        disabled: push.isPending,
        alternatives: [
          {
            Glyph: IconUpload,
            label: 'Force push',
            action: () => {
              if (branch?.type === 'local') {
                push.mutate({
                  branch: branch.name,
                  remote: branch.remote?.remoteName ?? 'origin',
                  remoteBranch: branch.remote?.branchName ?? branch.name,
                  isForce: true,
                  setUpstream: !branch.remote,
                })
              }
            },
            disabled: push.isPending,
          },
        ],
      },
    ]
  }, [branch, pull.mutate, pull.isPending, push.mutate, push.isPending])

  return (
    <Toolbar
      tools={tools}
      {...toolbarProps}
      disabled={toolbarProps.disabled || !branch || branch.type !== 'local'}
    />
  )
}

export { BranchToolbar, type BranchToolbarProps }
