import type { CommitId } from '@/api/models'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useMergeCommit } from '@/api/mutations/merge'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { runAction } from '@/context/actions'
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
        action={createBranch}
        trackOnly
        onClick={() => {
          requestBranchName(commitId).then((newBranchName) => {
            runAction(createBranch, newBranchName)
          })
        }}
      />

      <MenuItem
        action={branchOff}
        trackOnly
        onClick={() => {
          requestBranchName(commitId).then((newBranchName) => {
            runAction(branchOff, newBranchName)
          })
        }}
      />

      <MenuItem action={merge} />
    </>
  )
}

export { CommitContextMenu, type CommitContextMenuProps }
