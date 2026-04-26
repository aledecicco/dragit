import {
  useHotkeys,
  useHotkeysContext,
  useRecordHotkeys,
} from 'react-hotkeys-hook'

import { useStageAll } from '@/api/mutations/addToIndex'
import { useCommit } from '@/api/mutations/commitIndex'
import { useUnstageAll } from '@/api/mutations/removeFromIndex'
import { requestCommitParams } from '@/common/CommitDialog'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/settings'

export type ShortcutScope = 'app' | 'global'

/**
 * Binds a callback to the given hotkey.
 *
 * @returns A ref that can be attached to a component to require it to be focused for the shortcut to work.
 */
export const useShortcutBinding = (
  hotkey: string,
  callback: () => void,
  scope: ShortcutScope = 'app',
) => {
  return useHotkeys(hotkey, callback, {
    scopes: [scope],
    enableOnFormTags: true,
  })
}

export interface ShortcutScopesHandler {
  /**
   * Callback to enable a shortcut scope, allowing those shortcuts to be triggered.
   */
  enableScope: (scope: ShortcutScope) => void

  /**
   * Callback to disable a shortcut scope, preventing those shortcuts from being triggered.
   */
  disableScope: (scope: ShortcutScope) => void
}

/**
 * Hook that provides callbacks to handle the shortcut scopes.
 */
export const useShortcutScopesHandler = (): ShortcutScopesHandler => {
  const hotkeysContext = useHotkeysContext()

  return {
    enableScope: hotkeysContext.enableScope,
    disableScope: hotkeysContext.disableScope,
  }
}

export interface ShortcutRecorder {
  /**
   * Whether this recorder is actively listening for key presses.
   */
  isRecording: boolean

  /**
   * The set of keys recorded so far.
   */
  recorded: Set<string>

  /**
   * Callback to start listening for key presses.
   */
  start: () => void

  /**
   * Callback to stop listening for key presses.
   */
  stop: () => void

  /**
   * Callback to clear the set of recorded keys.
   */
  reset: () => void
}

export const useShortcutRecorder = (): ShortcutRecorder => {
  const [recorded, recorder] = useRecordHotkeys()

  return {
    isRecording: recorder.isRecording,
    recorded,
    start: recorder.start,
    stop: recorder.stop,
    reset: recorder.resetKeys,
  }
}

export const formatShortcut = (keys: Set<string>) => {
  const modifiers = ['ctrl', 'alt', 'shift', 'meta']
  const sortedKeys = [...keys].sort((a, b) => {
    const aIsModifier = modifiers.includes(a)
    const bIsModifier = modifiers.includes(b)

    if (aIsModifier && !bIsModifier) return -1
    if (!aIsModifier && bIsModifier) return 1

    if (a.length === 1 && b.length > 1) return -1
    if (a.length > 1 && b.length === 1) return 1

    return a.localeCompare(b)
  })

  return sortedKeys
    .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
    .join(' + ')
}

/**
 * Binds the configured shortcuts to their respective actions.
 */
export const useShortcutsSync = () => {
  const settings = useSettings()

  const stageAll = useStageAll()
  const unstageAll = useUnstageAll()
  const commit = useCommit()

  useShortcutBinding(settings.stageAllShortcut, () => {
    triggerInteraction({
      action: stageAll,
    })
  })
  useShortcutBinding(settings.unstageAllShortcut, () => {
    triggerInteraction({
      action: unstageAll,
    })
  })
  useShortcutBinding(settings.commitShortcut, () => {
    triggerInteraction({
      action: commit,
      argsRequester: requestCommitParams,
    })
  })
}
