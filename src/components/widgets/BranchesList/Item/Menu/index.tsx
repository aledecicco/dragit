import type { BranchInfo } from '@/api/models'
import { useCheckoutBranch } from '@/api/mutations/checkout'
import {
  useBranchOff,
  useCreateBranchAt,
  useTrackBranch,
} from '@/api/mutations/createBranch'
import { useFastForwardBranch } from '@/api/mutations/fastForwardBranch'
import { useMergeBranch } from '@/api/mutations/merge'
import { usePullBranch } from '@/api/mutations/pullBranch'
import { useRemoveBranch } from '@/api/mutations/removeBranch'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { runAction } from '@/context/actions'
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
  const merge = useMergeBranch(branch)
  const track = useTrackBranch(branch)

  return (
    <>
      {branch.type === 'local' && (
        <>
          {!isCurrentBranch && <MenuItem action={checkout} />}

          <MenuItem action={isCurrentBranch ? pull : fastForward} />

          <Separator />

          <MenuItem
            action={createBranch}
            trackOnly
            onClick={() => {
              requestBranchName(branch.name).then((newBranchName) => {
                runAction(createBranch, newBranchName)
              })
            }}
          />

          <MenuItem
            action={branchOff}
            trackOnly
            onClick={() => {
              requestBranchName(branch.name).then((newBranchName) => {
                runAction(branchOff, newBranchName)
              })
            }}
          />

          {!isCurrentBranch && (
            <>
              <MenuItem action={merge} />
              <Separator />
              <MenuItem action={remove} status="danger" />
            </>
          )}
        </>
      )}

      {branch.type === 'remote' && (
        <MenuItem
          action={track}
          trackOnly
          onClick={() => {
            requestBranchName(branch.name, branch.name.split('/').at(-1)).then(
              (newBranchName) => {
                runAction(branchOff, newBranchName)
              },
            )
          }}
        />
      )}
    </>
  )
}

export { BranchContextMenu, type BranchContextMenuProps }
