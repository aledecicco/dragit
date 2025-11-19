import type { BranchInfo } from '@/api/models'
import { useCheckoutBranch } from '@/api/mutations/checkout'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { useFastForwardBranch } from '@/api/mutations/fastForwardBranch'
import { usePullBranch } from '@/api/mutations/pullBranch'
import { useRemoveBranch } from '@/api/mutations/removeBranch'
import { showCreateBranchDialog } from '@/common/CreateBranchDialog'
import { useSelectedBranches } from '@/context/branches'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'

interface BranchContextMenuProps {
  branch: BranchInfo
}

const BranchContextMenu = (props: BranchContextMenuProps) => {
  const { branch } = props

  const { currentBranch } = useSelectedBranches()
  const isCurrentBranch = currentBranch && branch.name === currentBranch.name

  const checkout = useCheckoutBranch(branch)
  const fastForward = useFastForwardBranch(branch)
  const pull = usePullBranch(branch)
  const remove = useRemoveBranch(branch)
  const createBranch = useCreateBranchAt(branch.name)
  const branchOff = useBranchOff(branch.name)

  return (
    <>
      {!isCurrentBranch && <MenuItem action={checkout} />}
      {branch.type === 'local' && (
        <>
          <MenuItem action={isCurrentBranch ? pull : fastForward} />

          <Separator />

          <MenuItem
            action={createBranch}
            trackOnly
            onClick={() => {
              showCreateBranchDialog({
                fromReference: branch.name,
                jump: false,
              })
            }}
          />

          <MenuItem
            action={branchOff}
            trackOnly
            onClick={() => {
              showCreateBranchDialog({
                fromReference: branch.name,
                jump: true,
              })
            }}
          />

          {!isCurrentBranch && (
            <>
              <Separator />
              <MenuItem action={remove} status="danger" />
            </>
          )}
        </>
      )}
    </>
  )
}

export { BranchContextMenu, type BranchContextMenuProps }
