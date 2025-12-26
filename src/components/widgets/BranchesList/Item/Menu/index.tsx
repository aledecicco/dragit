import type { BranchInfo } from '@/api/models'
import { useCheckoutBranch } from '@/api/mutations/checkout'
import {
  useBranchOff,
  useCreateBranchAt,
  useTrackBranch,
} from '@/api/mutations/createBranch'
import { useFastForwardBranch } from '@/api/mutations/fastForwardBranch'
import { useMergeBranch } from '@/api/mutations/merge'
import { usePullBranch, useRebaseBranch } from '@/api/mutations/pullBranch'
import { useForcePushBranch, usePushBranch } from '@/api/mutations/pushBranch'
import { useRemoveBranch } from '@/api/mutations/removeBranch'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { useSelectedBranches } from '@/context/branches'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'

interface BranchContextMenuProps {
  /**
   * The branch to use for context menu actions.
   */
  branch: BranchInfo
}

/**
 * The context menu for branches.
 */
const BranchContextMenu = (props: BranchContextMenuProps) => {
  const { branch } = props

  const { currentBranch } = useSelectedBranches()
  const isCurrentBranch = currentBranch && branch.name === currentBranch.name

  const checkout = useCheckoutBranch(branch)
  const fastForward = useFastForwardBranch(branch)
  const pull = usePullBranch(branch)
  const rebase = useRebaseBranch(branch)
  const push = usePushBranch(branch)
  const forcePush = useForcePushBranch(branch)
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
          {isCurrentBranch && <MenuItem action={rebase} />}

          {isCurrentBranch && (
            <>
              <MenuItem action={push} />
              <MenuItem action={forcePush} />
            </>
          )}

          <Separator />

          <MenuItem
            action={createBranch}
            argsRequester={() => requestBranchName(branch.name)}
          />

          <MenuItem
            action={branchOff}
            argsRequester={() => requestBranchName(branch.name)}
          />

          {!isCurrentBranch && <MenuItem action={merge} />}
        </>
      )}

      {branch.type === 'remote' && (
        <MenuItem
          action={track}
          argsRequester={() =>
            requestBranchName(branch.name, branch.name.split('/').at(-1))
          }
        />
      )}

      {!isCurrentBranch && (
        <>
          <Separator />
          <MenuItem action={remove} status="danger" />{' '}
        </>
      )}
    </>
  )
}

export { BranchContextMenu, type BranchContextMenuProps }
