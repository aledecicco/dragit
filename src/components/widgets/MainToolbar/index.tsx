import { IconMessageCheck, IconUpload } from '@tabler/icons-react'

import { useCommitIndex, usePushBranch } from '@api/mutations'
import { useSelectedBranches } from '@context/branches'
import { showCommitDialog } from '@lib/CommitDialog'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'
import { useStagedFiles } from '@widgets/FileStatuses/utils'

interface MainToolbarProps extends Partial<ToolbarProps> {}

const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const staged = useStagedFiles()
  const commit = useCommitIndex()
  const push = usePushBranch()
  const { branch } = useSelectedBranches()

  return (
    <Toolbar
      variant="primary"
      size="md"
      compact={false}
      fixed
      tools={[
        {
          action: () => {
            showCommitDialog()
          },
          label: commit.isPending ? 'Committing...' : 'Commit',
          Glyph: IconMessageCheck,
          disabled: !staged?.length || commit.isPending,
        },
        {
          action: () => {
            if (branch?.type === 'local') {
              push.mutate({
                branch: branch.name,
                remote: branch.remote?.remoteName ?? 'origin',
                remoteBranch: branch.remote?.branchName ?? branch.name,
                isForce: false,
              })
            }
          },
          label: push.isPending ? 'Pushing...' : 'Push',
          Glyph: IconUpload,
          disabled: push.isPending,
        },
      ]}
      {...toolbarProps}
    />
  )
}

export { MainToolbar, type MainToolbarProps }
