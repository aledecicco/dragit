import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconLoader2,
} from '@tabler/icons-react'
import { useRef, useState } from 'react'
import { match } from 'ts-pattern'

import type { ButtonStatus } from '@ui/Button'
import type { Glyph } from '@ui/Icon'
import { MS_IN_SECOND } from '@utils/time'

interface ActionDescription {
  Glyph: Glyph
  label: string | { [T in ActionState]: string }
}

interface Action extends ActionDescription {
  run: () => Promise<unknown>
}

type ActionState = 'idle' | 'running' | 'success' | 'error'

interface ActionTracker {
  Glyph: Glyph
  label: string
  buttonStatus: ButtonStatus
  actionState: ActionState
  trackAction: (promise: Promise<unknown>, action: ActionDescription) => void
}

/**
 * A hook that facilitates tracking the state of an action button.
 *
 * Manages the icon and label of the button, allowing to track one of the alternative actions,
 * and reverting back to the main one once done.
 *
 * @param mainAction - The main action to use as default.
 * @param defaultStatus - The default status of the button while idle (used during running state also).
 *
 * @returns An object containing:
 * - `Glyph`: The icon to display in the button.
 * - `label`: The label to display in the button.
 * - `buttonStatus`: The status of the button, used for styling.
 * - `actionState`: The current state of the action being tracked.
 * - `trackAction`: A callback to trigger and start tracking an action.
 */
const useActionTracker = (
  mainAction: ActionDescription,
  defaultStatus: ButtonStatus,
): ActionTracker => {
  const [activeAction, setActiveAction] =
    useState<ActionDescription>(mainAction)
  const [actionState, setActionState] = useState<ActionState>('idle')
  const timeoutId = useRef<number>(null)

  const Glyph = match(actionState)
    .returnType<Glyph>()
    .with('idle', () => activeAction.Glyph)
    .with('running', () => IconLoader2)
    .with('success', () => IconCircleCheckFilled)
    .with('error', () => IconAlertTriangleFilled)
    .exhaustive()

  const label =
    typeof activeAction.label === 'string'
      ? activeAction.label
      : activeAction.label[actionState]

  const buttonStatus = match(actionState)
    .returnType<ButtonStatus>()
    .with('idle', () => defaultStatus)
    .with('running', () => defaultStatus)
    .with('success', () => 'success')
    .with('error', () => 'error')
    .exhaustive()

  const trackAction = (
    promise: Promise<unknown>,
    action: ActionDescription,
  ) => {
    if (actionState !== 'running') {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current)
      }

      setActiveAction(action)
      setActionState('running')
      promise
        .then(() => {
          setActionState('success')
        })
        .catch(() => {
          setActionState('error')
        })
        .finally(() => {
          timeoutId.current = setTimeout(() => {
            setActionState('idle')
            setActiveAction(mainAction)
          }, MS_IN_SECOND * 2)
        })
    }
  }

  return { Glyph, label, buttonStatus, actionState, trackAction }
}

export {
  useActionTracker,
  type Action,
  type ActionState,
  type ActionDescription,
  type ActionTracker,
}
