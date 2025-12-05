import {
  type Action,
  type ActionPresenter,
  useActionPresenters,
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
 */
const useActionButtonTracker = <T>(
  mainAction: Action<T> | Action<void>,
  alternatives: Action[] | undefined,
): ActionPresenter => {
  const actions = [mainAction, ...(alternatives ?? [])]
  const statuses = useActionStatuses(actions)

  const activeAction =
    actions.find((_, index) => statuses[index] === 'running') ??
    actions.find((_, index) => statuses[index] === 'error') ??
    actions.find((_, index) => statuses[index] === 'success') ??
    mainAction

  return useActionPresenters(activeAction)
}

export { useActionButtonTracker }
