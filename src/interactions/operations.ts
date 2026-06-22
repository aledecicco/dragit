import { useAbortCherryPick } from '@/api/mutations/abortCherryPick'
import { useAbortMerge } from '@/api/mutations/abortMerge'
import { useAbortRebase } from '@/api/mutations/abortRebase'
import { useAbortRevert } from '@/api/mutations/abortRevert'
import { useCommit } from '@/api/mutations/commitIndex'
import { useContinueCherryPick } from '@/api/mutations/continueCherryPick'
import { useContinueMerge } from '@/api/mutations/continueMerge'
import { useContinueRebase } from '@/api/mutations/continueRebase'
import { useContinueRevert } from '@/api/mutations/continueRevert'
import { requestCommitParams } from '@/common/CommitDialog'
import { interaction } from '@/lib/ActionButton/utils'

export const useCommitInteraction = () => {
  const commit = useCommit()
  return interaction({
    action: commit,
    argsRequester: requestCommitParams,
    details: 'commit staged changes',
  })
}

export const useAbortMergeInteraction = () => {
  const abort = useAbortMerge()
  return interaction({ action: abort, details: 'abort merge' })
}

export const useContinueMergeInteraction = () => {
  const continueMerge = useContinueMerge()
  return interaction({ action: continueMerge, details: 'continue merge' })
}

export const useAbortRebaseInteraction = () => {
  const abort = useAbortRebase()
  return interaction({ action: abort, details: 'abort rebase' })
}

export const useContinueRebaseInteraction = () => {
  const continueRebase = useContinueRebase()
  return interaction({ action: continueRebase, details: 'continue rebase' })
}

export const useAbortCherryPickInteraction = () => {
  const abort = useAbortCherryPick()
  return interaction({ action: abort, details: 'abort cherry-pick' })
}

export const useContinueCherryPickInteraction = () => {
  const continueCherryPick = useContinueCherryPick()
  return interaction({
    action: continueCherryPick,
    details: 'continue cherry-pick',
  })
}

export const useAbortRevertInteraction = () => {
  const abort = useAbortRevert()
  return interaction({ action: abort, details: 'abort revert' })
}

export const useContinueRevertInteraction = () => {
  const continueRevert = useContinueRevert()
  return interaction({ action: continueRevert, details: 'continue revert' })
}
