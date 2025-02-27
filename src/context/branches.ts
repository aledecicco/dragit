import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'

import { useCheckoutLocalBranch } from '@api/commands'
import type { BranchInfo } from '@api/models'
import { useCurrentBranch } from '@main/Graph/utils'

interface SelectedBranches {
  branch: BranchInfo | undefined
  baseBranch: BranchInfo | undefined
}

const selectedBranches = new Store<SelectedBranches>({
  branch: undefined,
  baseBranch: undefined,
})

const useSelectedBranches = () => useStore(selectedBranches)

const changeBranch = (branch: BranchInfo) => {
  const checkout = useCheckoutLocalBranch()
  return checkout(branch.name)
}

const changeBaseBranch = (baseBranch: BranchInfo | undefined) => {
  selectedBranches.setState((state) => ({
    ...state,
    baseBranch,
  }))
}

const useBranchesSync = () => {
  const currentBranch = useCurrentBranch()

  useEffect(() => {
    selectedBranches.setState((oldBranches) => ({
      branch: currentBranch,
      baseBranch:
        oldBranches.baseBranch &&
        oldBranches.baseBranch.name === currentBranch?.name
          ? oldBranches.branch
          : oldBranches.baseBranch,
    }))
  }, [currentBranch])
}

export { useSelectedBranches, changeBranch, changeBaseBranch, useBranchesSync }
