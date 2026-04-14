import { useHotkeys } from 'react-hotkeys-hook'

import { useStageAll } from '@/api/mutations/addToIndex'
import { useAmend, useCommitIndex } from '@/api/mutations/commitIndex'
import { useUnstageAll } from '@/api/mutations/removeFromIndex'
import { requestCommitParams } from '@/common/CommitDialog'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/settings'

/**
 * Binds the configured shortcuts to their respective actions.
 */
export const useShortcutBinding = () => {
  const settings = useSettings()

  const stageAll = useStageAll()
  const unstageAll = useUnstageAll()
  const commit = useCommitIndex()
  const amend = useAmend()

  useHotkeys(settings.stageAllShortcut, () => {
    triggerInteraction({
      action: stageAll,
    })
  })
  useHotkeys(settings.unstageAllShortcut, () => {
    triggerInteraction({
      action: unstageAll,
    })
  })
  useHotkeys(settings.commitShortcut, () => {
    triggerInteraction({
      action: commit,
      argsRequester: requestCommitParams,
    })
  })
  useHotkeys(settings.amendShortcut, () => {
    triggerInteraction({
      action: amend,
    })
  })
  useHotkeys(settings.pushShortcut, () => {})
  useHotkeys(settings.pullShortcut, () => {})
  useHotkeys(settings.refreshShortcut, () => {})
  useHotkeys(settings.focusUnstagedShortcut, () => {})
  useHotkeys(settings.focusStagedShortcut, () => {})
  useHotkeys(settings.focusBranchesShortcut, () => {})
  useHotkeys(settings.focusStashesShortcut, () => {})
  useHotkeys(settings.focusGraphShortcut, () => {})
}
