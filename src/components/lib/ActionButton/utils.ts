import {
  type Action,
  type ActionPresenter,
  useActionPresenters,
  useActionStatuses,
} from '@/context/actions'

/**
 * A hook that facilitates choosing which action to track for an action button.
 *
 * @param action - The main action to use as default.
 * @param alternatives - A list of alternative actions to track.
 */
const useActionButtonAction = <T>(
  action: Action<T> | Action<void>,
  alternatives: Action[] | undefined,
): Action<T> | Action<void> => {
  const actions = [action, ...(alternatives ?? [])]
  const statuses = useActionStatuses(actions)

  const activeAction =
    actions.find((_, index) => statuses[index] === 'running') ??
    actions.find((_, index) => statuses[index] === 'error') ??
    actions.find((_, index) => statuses[index] === 'success') ??
    action

  return activeAction
}

/**
 * A hook that facilitates tracking the state of an action button.
 *
 * Manages the icon and label of the button, allowing to track one of the alternative actions,
 * and reverting back to the main one once done.
 *
 * @param action - The main action to use as default.
 * @param alternatives - A list of alternative actions to track.
 * @param defaultStatus - The default status of the button while all actions are idle (used during running state also).
 */
const useActionButtonTracker = <T>(
  action: Action<T> | Action<void>,
  alternatives: Action[] | undefined,
): ActionPresenter => {
  const activeAction = useActionButtonAction(action, alternatives)

  return useActionPresenters(activeAction)
}

export { useActionButtonAction, useActionButtonTracker }
