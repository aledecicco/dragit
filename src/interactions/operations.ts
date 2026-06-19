import { useAbortCherryPick } from '@/api/mutations/abortCherryPick'
import { useAbortMerge } from '@/api/mutations/abortMerge'
import { useAbortRebase } from '@/api/mutations/abortRebase'
import { useAbortRevert } from '@/api/mutations/abortRevert'
import { useStageAll } from '@/api/mutations/addToIndex'
import { useCommit } from '@/api/mutations/commitIndex'
import { useContinueCherryPick } from '@/api/mutations/continueCherryPick'
import { useContinueMerge } from '@/api/mutations/continueMerge'
import { useContinueRebase } from '@/api/mutations/continueRebase'
import { useContinueRevert } from '@/api/mutations/continueRevert'
import { requestCommitParams } from '@/common/CommitDialog'
import { interaction } from '@/lib/ActionButton/utils'

export const useStageAllInteraction = () => {
  const stageAll = useStageAll()
  return interaction({ action: stageAll, details: 'stage all changes' })
}

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
  const cont = useContinueMerge()
  return interaction({ action: cont, details: 'continue merge' })
}

export const useAbortRebaseInteraction = () => {
  const abort = useAbortRebase()
  return interaction({ action: abort, details: 'abort rebase' })
}

export const useContinueRebaseInteraction = () => {
  const cont = useContinueRebase()
  return interaction({ action: cont, details: 'continue rebase' })
}

export const useAbortCherryPickInteraction = () => {
  const abort = useAbortCherryPick()
  return interaction({ action: abort, details: 'abort cherry-pick' })
}

export const useContinueCherryPickInteraction = () => {
  const cont = useContinueCherryPick()
  return interaction({ action: cont, details: 'continue cherry-pick' })
}

export const useAbortRevertInteraction = () => {
  const abort = useAbortRevert()
  return interaction({ action: abort, details: 'abort revert' })
}

export const useContinueRevertInteraction = () => {
  const cont = useContinueRevert()
  return interaction({ action: cont, details: 'continue revert' })
}
