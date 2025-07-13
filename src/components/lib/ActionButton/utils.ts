import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconLoader2,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'

import {
  type Action,
  type ActionDescription,
  type ActionId,
  useActionStatuses,
} from '@/context/actions'
import type { ButtonStatus } from '@/ui/Button'
import type { Glyph } from '@/ui/Icon'

/**
 * A hook that provides the necessary info to correctly display an action button tracking the given action.
 *
 * @param action - The action to track.
 * @param defaultStatus - The default status of the button while idle (used during running state also).
 *
 * @returns An object containing:
 * - `Glyph`: The icon to display based on the action status.
 * - `label`: The label to display based on the action status.
 * - `actionStatus`: The current status of the action.
 * - `buttonStatus`: The status to use for the button.
 */
const useActionButtonPresenter = (
  actionId: ActionId,
  actionDescription: ActionDescription,
  defaultStatus: ButtonStatus,
) => {
  const actionStatus = useActionStatuses(actionId)

  const Glyph = match(actionStatus)
    .returnType<Glyph>()
    .with('idle', () => actionDescription.Glyph)
    .with('running', () => IconLoader2)
    .with('success', () => IconCircleCheckFilled)
    .with('error', () => IconAlertTriangleFilled)
    .exhaustive()

  const label = actionDescription.label[actionStatus]

  const buttonStatus = match(actionStatus)
    .returnType<ButtonStatus>()
    .with('idle', () => defaultStatus)
    .with('running', () => defaultStatus)
    .with('success', () => 'success')
    .with('error', () => 'error')
    .exhaustive()

  return { Glyph, label, actionStatus, buttonStatus }
}

/**
 * A hook that facilitates tracking the state of an action button.
 *
 * Manages the icon and label of the button, allowing to track one of the alternative actions,
 * and reverting back to the main one once done.
 *
 * @param mainAction - The main action to use as default.
 * @param alternatives - A list of alternative actions to track.
 * @param defaultStatus - The default status of the button while all actions are idle (used during running state also).
 *
 * @returns An object containing:
 * - `Glyph`: The icon to display based on the active action status.
 * - `label`: The label to display based on the active action status.
 * - `actionStatus`: The current status of the active action.
 * - `buttonStatus`: The status to use for the button.
 */
const useActionButtonTracker = <T>(
  mainAction: Action<T> | Action<void>,
  alternatives: Action[] | undefined,
  defaultStatus: ButtonStatus,
) => {
  const actions = [mainAction, ...(alternatives ?? [])]
  const statuses = useActionStatuses(...actions.map((action) => action.id))

  const activeAction =
    actions.find((_, index) => statuses[index] === 'running') ??
    actions.find((_, index) => statuses[index] === 'error') ??
    mainAction

  return useActionButtonPresenter(activeAction.id, activeAction, defaultStatus)
}

export { useActionButtonPresenter, useActionButtonTracker }
