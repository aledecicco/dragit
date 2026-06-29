import type { BranchInfo, CommitId, TagInfo } from '@/api/models'
import {
  useCheckout,
  useMakeCheckoutBranch,
  useMakeCheckoutTag,
  useSwitchBranches,
} from '@/api/mutations/checkout'
import { interaction } from '@/lib/ActionButton/utils'
import { useActionPresenters } from '@/state/actions'

export const useCheckoutPresenter = () => {
  const checkout = useCheckout()
  return useActionPresenters(checkout)
}

export const useSwitchBranchesInteraction = () => {
  const switchBranches = useSwitchBranches()
  return interaction({ action: switchBranches, details: 'switch branches' })
}

export const useCheckoutSomeCommitInteraction = () => {
  const checkout = useCheckout()
  return (commit: CommitId) =>
    interaction({
      action: checkout,
      argsRequester: () => ({ reference: commit, isNew: false }),
      details: `checkout commit #${commit}`,
    })
}

export const useCheckoutSomeBranchInteraction = () => {
  const makeCheckout = useMakeCheckoutBranch()
  return (branch: BranchInfo) =>
    interaction({
      action: makeCheckout(branch),
      details: `checkout "${branch.name}"`,
    })
}

export const useCreateAndCheckoutBranchInteraction = () => {
  const checkout = useCheckout()
  return (name: string) =>
    interaction({
      action: checkout,
      argsRequester: () => ({ reference: name, isNew: true }),
      details: `create and checkout branch "${name}"`,
    })
}

export const useCheckoutSomeTagInteraction = () => {
  const makeCheckout = useMakeCheckoutTag()
  return (tag: TagInfo) =>
    interaction({
      action: makeCheckout(tag),
      details: `checkout tag "${tag.name}"`,
    })
}
