import { IconUpload } from '@tabler/icons-react'

import type { BranchInfo } from '@/api/models'
import { useCommitIndex } from '@/api/mutations/commitIndex'
import { usePushBranch } from '@/api/mutations/pushBranch'
import { requestCommitParams } from '@/common/CommitDialog'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { useCurrentBranch } from '@/utils/repository'

interface SecondaryToolbarProps extends Partial<ToolbarProps> {}

/**
 * Main app widget that displays a toolbar with the most important actions for update handling.
 */
const SecondaryToolbar = (props: SecondaryToolbarProps) => {
  const { ...toolbarProps } = props

  const commit = useCommitIndex()
  const currentBranch = useCurrentBranch()

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        fixed
        status="primary"
        size="md"
        compact={false}
        action={commit}
        argsRequester={requestCommitParams}
      />

      {currentBranch ? (
        <PushItem branch={currentBranch} />
      ) : (
        <ToolbarItem
          fixed
          label="Push"
          Glyph={IconUpload}
          status="primary"
          size="md"
          compact={false}
          disabled
        />
      )}
    </Toolbar>
  )
}

const PushItem = (props: { branch: BranchInfo }) => {
  const { branch } = props

  const push = usePushBranch(branch)

  return (
    <ToolbarItem
      fixed
      status="primary"
      size="md"
      compact={false}
      action={push}
    />
  )
}

export { SecondaryToolbar, type SecondaryToolbarProps }
