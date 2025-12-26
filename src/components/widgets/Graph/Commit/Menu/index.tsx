import type { CommitId } from '@/api/models'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useMergeCommit } from '@/api/mutations/merge'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { MenuItem } from '@/ui/Menu/Item'

interface CommitContextMenuProps {
  /**
   * The commit to use for context menu actions.
   */
  commitId: CommitId
}

/**
 * The context menu for commits.
 */
const CommitContextMenu = (props: CommitContextMenuProps) => {
  const { commitId } = props

  const createBranch = useCreateBranchAt(commitId)
  const branchOff = useBranchOff(commitId)
  const merge = useMergeCommit(commitId)

  return (
    <>
      <MenuItem
        action={createBranch}
        argsRequester={() => requestBranchName(commitId)}
      />

      <MenuItem
        action={branchOff}
        argsRequester={() => requestBranchName(commitId)}
      />

      <MenuItem action={merge} />
    </>
  )
}

export { CommitContextMenu, type CommitContextMenuProps }
