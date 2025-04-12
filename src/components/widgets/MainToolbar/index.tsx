import { IconMessageCheck, IconPackage, IconUpload } from '@tabler/icons-react'

import { useCommitIndex, usePushBranch, useSaveStash } from '@api/mutations'
import { showCommitDialog } from '@common/CommitDialog'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'
import { useSelectedBranches } from '@utils/repository'
import { useMemo } from 'react'

interface MainToolbarProps extends Partial<ToolbarProps> {}

const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const commit = useCommitIndex()
  const push = usePushBranch()
  const stash = useSaveStash()
  const { branch } = useSelectedBranches()

  const tools = useMemo(() => {
    return [
      {
        action: () => {
          stash.mutateAsync({
            files: ['.'],
            message: null,
            includeUntracked: true,
          })
        },
        label: stash.isPending ? 'Stashing...' : 'Quick Stash',
        Glyph: IconPackage,
        disabled: stash.isPending,
      },
      {
        action: () => {
          showCommitDialog()
        },
        label: commit.isPending ? 'Committing...' : 'Commit',
        Glyph: IconMessageCheck,
        disabled: commit.isPending,
      },
      {
        action: () => {
          if (branch?.type === 'local') {
            push.mutateAsync({
              branch: branch.name,
              remote: branch.remote?.remoteName ?? 'origin',
              remoteBranch: branch.remote?.branchName ?? branch.name,
              isForce: false,
              setUpstream: !branch.remote,
            })
          }
        },
        label: push.isPending ? 'Pushing...' : 'Push',
        Glyph: IconUpload,
        disabled: push.isPending,
      },
    ]
  }, [
    branch,
    commit.isPending,
    push.mutateAsync,
    push.isPending,
    stash.mutateAsync,
    stash.isPending,
  ])

  return (
    <Toolbar
      variant="primary"
      size="md"
      compact={false}
      fixed
      tools={tools}
      {...toolbarProps}
    />
  )
}

export { MainToolbar, type MainToolbarProps }
