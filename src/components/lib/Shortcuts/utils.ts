import {
  useHotkeys,
  useHotkeysContext,
  useRecordHotkeys,
} from 'react-hotkeys-hook'

import { capitalize } from '@/utils/string'

export type ShortcutScope = 'app' | 'global'

export type ShortcutSequence = string[]

export type ShortcutKeys = Set<string>

export const SHORTCUT_SEPARATOR = ' + '
export const SHORTCUT_MODIFIERS = ['ctrl', 'shift', 'alt', 'meta']

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
  recorded: ShortcutKeys

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

/**
 * Hook that provides the state and callbacks necessary to record a shortcut key combination.
 */
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

/**
 * Gets a set of keys from a hotkey string.
 */
export const getShortcutKeys = (hotkey: string): ShortcutKeys => {
  return new Set(
    hotkey.split(SHORTCUT_SEPARATOR).map((key) => key.toLowerCase()),
  )
}

/**
 * Turns a set of keys into a readable shortcut sequence.
 */
export const getShortcutSequence = (keys: ShortcutKeys): ShortcutSequence => {
  const sortedKeys = [...keys].sort((a, b) => {
    const aIsModifier = SHORTCUT_MODIFIERS.includes(a)
    const bIsModifier = SHORTCUT_MODIFIERS.includes(b)

    if (aIsModifier && !bIsModifier) return -1
    if (!aIsModifier && bIsModifier) return 1

    if (a.length === 1 && b.length > 1) return -1
    if (a.length > 1 && b.length === 1) return 1

    return a.localeCompare(b)
  })

  return sortedKeys
}

/**
 *  Turns a sequence of keys into a readable shortcut string.
 */
export const formatShortcut = (keys: ShortcutSequence): string => {
  return keys.map(capitalize).join(SHORTCUT_SEPARATOR)
}
