import {
  type Action,
  useActionPresenter,
  useActionStatuses,
} from '@/context/actions'

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
) => {
  const actions = [mainAction, ...(alternatives ?? [])]
  const statuses = useActionStatuses(...actions.map((action) => action.id))

  const activeAction =
    actions.find((_, index) => statuses[index] === 'running') ??
    actions.find((_, index) => statuses[index] === 'error') ??
    mainAction

  return useActionPresenter(activeAction.id, activeAction)
}

export { useActionButtonTracker }
