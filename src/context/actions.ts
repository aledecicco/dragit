import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconLoader2,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import type { Glyph } from '@/ui/Icon'
import { MS_IN_SECOND } from '@/utils/time'

type ActionId = string

type ActionStatus = 'idle' | 'running' | 'success' | 'error'

/**
 * An action that can be triggered and tracked, involving an async workload.
 */
interface Action<T = void> {
  /**
   * The unique identifier of the action.
   */
  id: ActionId

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

interface Setters {
  /**
   * Updates the status of an action in the tracker.
   *
   * @param id - The unique identifier of the action.
   * @param status - The new status of the action. If `undefined`, the action will be removed.
   */
  setActionStatus: (id: ActionId, status: ActionStatus | undefined) => void

  /**
   * Updates the timer for an action in the tracker.
   *
   * @param id - The unique identifier of the action.
   * @param timeoutId - The ID of the new timer. If `undefined`, the timer will be cleared.
   */
  setActionTimer: (id: ActionId, timeoutId: number | undefined) => void
}

const useActionsStore = create<ActionsTracker & Setters>()(
  immer((setState) => ({
    actions: new Map(),
    timers: new Map(),

    setActionStatus: (id: ActionId, status: ActionStatus | undefined) => {
      setState((state) => {
        if (status === undefined) {
          state.actions.delete(id)
        } else {
          state.actions.set(id, status)
        }
      })
    },

    setActionTimer: (id: ActionId, timeoutId: number | undefined) => {
      setState((state) => {
        const timer = state.timers.get(id)
        if (timer !== undefined) {
          clearTimeout(timer)
        }

        if (timeoutId === undefined) {
          state.timers.delete(id)
        } else {
          state.timers.set(id, timeoutId)
        }
      })
    },
  })),
)

/**
 * Hook that facilitates tracking the status of one or more actions.
 *
 * @param id - The unique identifier/s of the action/s to track.
 * @returns An {@link ActionStatus}  for each action ID provided.
 */
function useActionStatuses(id: ActionId): ActionStatus
function useActionStatuses(ids: ActionId[]): ActionStatus[]
function useActionStatuses(ids: ActionId | ActionId[]) {
  return useActionsStore(
    useShallow((state) => {
      if (!Array.isArray(ids)) {
        const actionId = ids
        return state.actions.get(actionId) || 'idle'
      }

      const statuses = ids.map(
        (actionId) => state.actions.get(actionId) || 'idle',
      )

      return statuses
    }),
  )
}

/**
 * Function to run and start tracking an action.
 *
 * @param action - The action to run.
 * @param args - The arguments to pass to the action.
 */
async function runAction<T>(action: Action<T>, args: T): Promise<void>
async function runAction(action: Action<void>): Promise<void>
async function runAction<T>(action: Action<T>, args?: T): Promise<void> {
  const store = useActionsStore.getState()
  const status = store.actions.get(action.id) ?? 'idle'

  if (status !== 'running') {
    store.setActionStatus(action.id, 'running')
    store.setActionTimer(action.id, undefined)

    return action
      .run(args as T)
      .then(() => {
        store.setActionStatus(action.id, 'success')
      })
      .catch(() => {
        store.setActionStatus(action.id, 'error')
      })
      .finally(() => {
        const timeoutId = setTimeout(() => {
          store.setActionStatus(action.id, undefined)
        }, MS_IN_SECOND * 2)
        store.setActionTimer(action.id, timeoutId)
      })
  }
}

// biome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the actions.
type AnyAction = Action<any>

/**
 * Utility function to get the icon to display for an action based on its status.
 */
const getActionGlyph = (action: AnyAction, status: ActionStatus): Glyph => {
  return match(status)
    .returnType<Glyph>()
    .with('idle', () => action.Glyph)
    .with('running', () => IconLoader2)
    .with('success', () => IconCircleCheckFilled)
    .with('error', () => IconAlertTriangleFilled)
    .exhaustive()
}

interface ActionPresenter {
  Glyph: Glyph
  label: string
  actionStatus: ActionStatus
}
/**
 * A hook that provides the necessary info to correctly display one or more actions.
 *
 * @param action - The action/s to track.
 *
 * @returns An {@link ActionPresenter} for each action provider.
 */
function useActionPresenters(action: AnyAction): ActionPresenter
function useActionPresenters(actions: AnyAction[]): ActionPresenter[]
function useActionPresenters(actions: AnyAction | AnyAction[]) {
  const actionStatuses = useActionStatuses(
    Array.isArray(actions) ? actions.map((action) => action.id) : [actions.id],
  )

  if (!Array.isArray(actions)) {
    const action = actions
    const status = actionStatuses.at(0) ?? 'idle'

    return {
      Glyph: getActionGlyph(action, status),
      label: action.label[status],
      actionStatus: status,
    }
  }

  return actions.map((action, index) => {
    const status = actionStatuses.at(index) ?? 'idle'

    return {
      Glyph: getActionGlyph(action, status),
      label: action.label[status],
      actionStatus: status,
    }
  })
}

export { useActionStatuses, runAction, useActionPresenters }
export type { Action, ActionId, ActionStatus, ActionPresenter }
