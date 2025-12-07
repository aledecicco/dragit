import type { CommitId } from '@/api/models'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useMergeCommit } from '@/api/mutations/merge'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { MenuItem } from '@/ui/Menu/Item'

interface CommitContextMenuProps {
  commitId: CommitId
}

const CommitContextMenu = (props: CommitContextMenuProps) => {
  const { commitId } = props

  const createBranch = useCreateBranchAt(commitId)
  const branchOff = useBranchOff(commitId)
  const merge = useMergeCommit(commitId)

  return (
    <>
      <MenuItem
        mainAction={createBranch}
        argsRequester={() => requestBranchName(commitId)}
      />

      <MenuItem
        mainAction={branchOff}
        argsRequester={() => requestBranchName(commitId)}
      />

      <MenuItem mainAction={merge} />
    </>
  )
}

export { CommitContextMenu, type CommitContextMenuProps }
