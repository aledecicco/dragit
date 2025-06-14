import { IconDownload, IconUpload } from '@tabler/icons-react'

import type { BranchInfo } from '@/api/models'
import { usePullBranch, usePushBranch } from '@/api/mutations'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'

interface BranchToolbarProps extends Partial<ToolbarProps> {
  /**
   * The branch to operate on.
   */
  branch: BranchInfo | undefined
}

/**
 * The common set of tools for branches (both local and remote).
 */
const BranchToolbar = (props: BranchToolbarProps) => {
  const { branch, ...toolbarProps } = props

  const pull = usePullBranch()
  const push = usePushBranch()

  const tools = [
    {
      action: {
        Glyph: IconDownload,
        label: {
          idle: 'Pull',
          running: 'Pulling',
          success: 'Pulled',
          error: 'Failed',
        },
        run: async () => {
          if (branch?.type === 'local') {
            await pull.mutateAsync({
              branch: branch.name,
              remote: branch.remote?.remoteName ?? 'origin',
              remoteBranch: branch.remote?.branchName ?? branch.name,
              isRebase: false,
            })
          } else {
            throw new Error('Branch is not local')
          }
        },
      },
    },
    {
      action: {
        Glyph: IconUpload,
        label: {
          idle: 'Push',
          running: 'Pushing',
          success: 'Pushed',
          error: 'Failed',
        },
        run: async () => {
          if (branch?.type === 'local') {
            await push.mutateAsync({
              branch: branch.name,
              remote: branch.remote?.remoteName ?? 'origin',
              remoteBranch: branch.remote?.branchName ?? branch.name,
              isForce: false,
              setUpstream: true,
            })
          } else {
            throw new Error('Branch is not local')
          }
        },
      },
      alternatives: [
        {
          Glyph: IconUpload,
          label: {
            idle: 'Force push',
            running: 'Pushing',
            success: 'Pushed',
            error: 'Failed',
          },
          run: async () => {
            if (branch?.type === 'local') {
              await push.mutateAsync({
                branch: branch.name,
                remote: branch.remote?.remoteName ?? 'origin',
                remoteBranch: branch.remote?.branchName ?? branch.name,
                isForce: true,
                setUpstream: true,
              })
            } else {
              throw new Error('Branch is not local')
            }
          },
        },
      ],
    },
  ]

  return (
    <Toolbar
      tools={tools}
      {...toolbarProps}
      disabled={toolbarProps.disabled || !branch || branch.type !== 'local'}
    />
  )
}

export { BranchToolbar, type BranchToolbarProps }
