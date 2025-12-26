import type { CommitId } from '@/api/models'
import { useAmend } from '@/api/mutations/commitIndex'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useMergeCommit } from '@/api/mutations/merge'
import { useQueryCommitInfo } from '@/api/queries/commitInfo'
import { requestCommitParams } from '@/common/CommitDialog'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { MenuItem } from '@/ui/Menu/Item'

interface CommitContextMenuProps {
  /**
   * The commit to use for context menu actions.
   */
  commitId: CommitId

  /**
   * Whether this commit is the current one can be amended.
   */
  allowAmend?: boolean
}

/**
 * The context menu for commits.
 */
const CommitContextMenu = (props: CommitContextMenuProps) => {
  const { commitId, allowAmend } = props

  const commitInfo = useQueryCommitInfo(commitId).data

  const createBranch = useCreateBranchAt(commitId)
  const branchOff = useBranchOff(commitId)
  const merge = useMergeCommit(commitId)
  const amend = useAmend()

  return (
    <>
      {allowAmend && commitInfo && (
        <MenuItem
          action={amend}
          argsRequester={() =>
            requestCommitParams(commitInfo.message ?? '', true)
          }
        />
      )}

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
