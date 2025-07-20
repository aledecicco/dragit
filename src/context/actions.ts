import { Store, useStore } from '@tanstack/react-store'

import type { Glyph } from '@/ui/Icon'
import { MS_IN_SECOND } from '@/utils/time'

type ActionId = string

type ActionStatus = 'idle' | 'running' | 'success' | 'error'

interface ActionDescription {
  /**
   * Collection of labels for the action, depending on its state.
   */
  label: {
    [k in ActionStatus]: string
  }

  /**
   * Icon to display during the idle state.
   */
  Glyph: Glyph
}

interface Action<T = void> extends ActionDescription {
  /**
   * The unique identifier of the action.
   */
  id: ActionId

  /**
   * Async function that performs the action.
   */
  run: (args: T) => Promise<void>
}

interface ActionsTracker {
  /**
   * Map of action IDs to their current status.
   */
  actions: Map<ActionId, ActionStatus>

  /**
   * Map of action IDs to their timeout IDs for managing timers.
   */
  timers: Map<ActionId, number>
}

const actionsTracker = new Store<ActionsTracker>({
  actions: new Map(),
  timers: new Map(),
})

/**
 * Updates the status of an action in the tracker.
 *
 * @param id - The unique identifier of the action.
 * @param status - The new status of the action. If `undefined`, the action will be removed.
 */
const setActionStatus = (id: ActionId, status: ActionStatus | undefined) => {
  actionsTracker.setState((state) => {
    const actions = new Map(state.actions)

    if (status === undefined) {
      actions.delete(id)
    } else {
      actions.set(id, status)
    }

    return { ...state, actions }
  })
}

/**
 * Updates the timer for an action in the tracker.
 *
 * @param id - The unique identifier of the action.
 * @param timeoutId - The ID of the timeout to set or clear. If `undefined`, the timer will be cleared.
 */
const setActionTimer = (id: ActionId, timeoutId: number | undefined) => {
  actionsTracker.setState((state) => {
    const timers = new Map(state.timers)

    const timer = timers.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
    }

    if (timeoutId === undefined) {
      timers.delete(id)
    } else {
      timers.set(id, timeoutId)
    }

    return { ...state, timers }
  })
}

/**
 * Hook that facilitates tracking the status of one or more actions.
 *
 * @param id - The unique identifier of the action to track.
 * @returns ActionStatus when called with a single id, ActionStatus[] when called with multiple ids
 */
function useActionStatuses(id: ActionId): ActionStatus
function useActionStatuses(...ids: ActionId[]): ActionStatus[]
function useActionStatuses(...ids: ActionId[]) {
  return useStore(actionsTracker, (state) => {
    if (ids.length === 1) {
      return state.actions.get(ids[0]) || 'idle'
    }

    const statuses = ids.map(
      (actionId) => state.actions.get(actionId) || 'idle',
    )

    return statuses
  })
}

/**
 * Function to run an action, tracking it by its ID.
 *
 * @param id - The unique identifier of the action.
 * @param runAction - The callback that performs the action.
 */
const runAction = async (id: ActionId, runAction: () => Promise<void>) => {
  const status = actionsTracker.state.actions.get(id) ?? 'idle'

  if (status !== 'running') {
    setActionStatus(id, 'running')
    setActionTimer(id, undefined)

    await runAction()
      .then(() => {
        setActionStatus(id, 'success')
      })
      .catch(() => {
        setActionStatus(id, 'error')
      })
      .finally(() => {
        const timeoutId = setTimeout(() => {
          setActionStatus(id, undefined)
        }, MS_IN_SECOND * 2)
        setActionTimer(id, timeoutId)
      })
  }
}

export { useActionStatuses, runAction }
export type { Action, ActionId, ActionDescription, ActionStatus }
