import type { BranchInfo, CommitId, TagInfo } from '@/api/models'
import {
  useCheckoutNew,
  useDummyCheckout,
  useMakeCheckoutBranch,
  useMakeCheckoutCommit,
  useMakeCheckoutTag,
  useSwitchBranches,
} from '@/api/mutations/checkout'
import { interaction } from '@/lib/ActionButton/utils'
import { useActionPresenters } from '@/state/actions'

export const useCheckoutPresenter = () => {
  const checkout = useDummyCheckout()
  return useActionPresenters(checkout)
}

export const useSwitchBranchesInteraction = () => {
  const switchBranches = useSwitchBranches()
  return interaction({ action: switchBranches, details: 'switch branches' })
}

export const useCheckoutSomeCommitInteraction = () => {
  const makeCheckout = useMakeCheckoutCommit()

  return (commit: CommitId) =>
    interaction({
      action: makeCheckout(commit),
      argsRequester: () => ({ reference: commit, isNew: false }),
      details: `checkout commit #${commit}`,
    })
}

export const useCheckoutSomeBranchInteraction = () => {
  const makeCheckout = useMakeCheckoutBranch()
  return (branch: BranchInfo) =>
    interaction({
      action: makeCheckout(branch),
      details: `checkout branch "${branch.name}"`,
    })
}

export const useCreateAndCheckoutBranchInteraction = () => {
  const checkout = useCheckoutNew()
  return (name: string) =>
    interaction({
      action: checkout,
      argsRequester: () => name,
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
