import type { CommitId } from '@/api/models'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { showCreateBranchDialog } from '@/common/CreateBranchDialog'
import { MenuItem } from '@/ui/Menu/Item'

interface CommitContextMenuProps {
  commitId: CommitId
}

const CommitContextMenu = (props: CommitContextMenuProps) => {
  const { commitId } = props

  const createBranch = useCreateBranchAt(commitId)
  const branchOff = useBranchOff(commitId)

  return (
    <>
      <MenuItem
        action={createBranch}
        trackOnly
        onClick={() => {
          showCreateBranchDialog({ fromReference: commitId, jump: false })
        }}
      />
      <MenuItem
        action={branchOff}
        trackOnly
        onClick={() => {
          showCreateBranchDialog({ fromReference: commitId, jump: true })
        }}
      />
    </>
  )
}

export { CommitContextMenu, type CommitContextMenuProps }
