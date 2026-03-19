import {
  IconAlertHexagonFilled,
  IconCheck,
  IconLoader2,
} from '@tabler/icons-react'
import { match } from 'ts-pattern'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import type { Glyph } from '@/ui/Icon'
import { MS_IN_SECOND } from '@/utils/time'

type ActionId = Record<string, string>
type HashedId = string

type ActionStatus = 'idle' | 'running' | 'success' | 'error' | 'disabled'

/**
 * An action that can be triggered and tracked, involving an async workload.
 */
interface Action<T = void> {
  /**
   * The unique identifier of the action.
   */
  id: ActionId

  /**
   * List of action IDs that block this action while running.
   */
  blockedBy?: ActionId[]

  /**
   * Collection of labels for the action, depending on its state.
   */
  label: {
    [k in Exclude<ActionStatus, 'disabled'>]: string
  }

  /**
   * Icon to display during the idle state.
   */
  Glyph: Glyph

  /**
   * Async function that performs the action.
   */
  run: (args: T) => Promise<void>

  /**
   * Optional function that derives additional action IDs that mirror the main action's status.
   */
  derivedIds?: (args: T) => ActionId[]
}

interface ActionsTracker {
  /**
   * Map of action IDs to their current status.
   */
  actions: Map<HashedId, ActionStatus>

  /**
   * Map of action IDs to their timeout IDs for managing timers.
   */
  timers: Map<HashedId, number>
}

interface Methods {
  /**
   * Searches for the status of an action in the tracker.
   *
   * @param id - The unique identifier of the action.
   */
  getActionStatus: (id: ActionId) => ActionStatus | undefined

  /**
   * Searches for the timer for an action in the tracker.
   *
   * @param id - The unique identifier of the action.
   */
  getActionTimer: (id: ActionId) => number | undefined

  /**
   * Updates the statuses of a set actions in the tracker.
   *
   * @param statuses - An array of items containing:
   * - `id`: The unique identifier of the action.
   * - `status`: The new status of the action. If `undefined`, the action will be untracked.
   */
  setActionStatuses: (
    statuses: { id: ActionId; status: ActionStatus | undefined }[],
  ) => void

  /**
   * Updates the timers for set of actions in the tracker.
   *
   * @param timers - An array of items containing:
   * - `id`: The unique identifier of the action.
   * - `timeoutId`: The ID of the new timer. If `undefined`, the timer will be cleared.
   */
  setActionTimers: (
    timers: { id: ActionId; timeoutId: number | undefined }[],
  ) => void
}

const useActionsStore = create<ActionsTracker & Methods>()(
  immer((setState, getState) => ({
    actions: new Map(),
    timers: new Map(),

    getActionStatus: (id) => {
      return getState().actions.get(hashId(id))
    },

    getActionTimer: (id) => {
      return getState().timers.get(hashId(id))
    },

    setActionStatuses: (statuses) => {
      setState((state) => {
        statuses.forEach(({ id, status }) => {
          if (status === undefined) {
            state.actions.delete(hashId(id))
          } else {
            state.actions.set(hashId(id), status)
          }
        })
      })
    },

    setActionTimers: (timers) => {
      setState((state) => {
        timers.forEach(({ id, timeoutId }) => {
          const timer = state.timers.get(hashId(id))
          if (timer !== undefined) {
            clearTimeout(timer)
          }

          if (timeoutId === undefined) {
            state.timers.delete(hashId(id))
          } else {
            state.timers.set(hashId(id), timeoutId)
          }
        })
      })
    },
  })),
)

/**
 * Hashes an action ID to be used as a key.
 */
const hashId = (id: ActionId): HashedId => {
  return JSON.stringify(id)
}

/**
 * Whether an action's ID contains another action's ID.
 *
 * @param search The ID to search for.
 * @param target The ID to search in.
 */
const containsId = (search: ActionId, target: ActionId): boolean => {
  return Object.entries(search).every(([key, value]) => target[key] === value)
}

/**
 * Computes an action's status based on the statuses of all contained actions.
 */
const computeActionStatus = (
  store: ActionsTracker,
  action: AnyAction,
): ActionStatus => {
  const containedStatus: ActionStatus[] = []

  store.actions.forEach((status, actionIdHash) => {
    const actionId = JSON.parse(actionIdHash) as ActionId
    if (containsId(action.id, actionId)) {
      containedStatus.push(status)
    }
  })

  if (containedStatus.includes('running')) {
    return 'running'
  }

  if (containedStatus.includes('error')) {
    return 'error'
  }

  if (containedStatus.includes('success')) {
    return 'success'
  }

  let isBlocked = false

  store.actions.forEach((status, actionIdHash) => {
    const actionId: ActionId = JSON.parse(actionIdHash) as ActionId

    if (
      status === 'running' &&
      action.blockedBy?.some((blockingId) => containsId(blockingId, actionId))
    ) {
      isBlocked = true
    }
  })

  if (isBlocked) {
    return 'disabled'
  }

  return store.actions.get(hashId(action.id)) ?? 'idle'
}

/**
 * Hook that facilitates tracking the status of one or more actions.
 *
 * @param action - The action/s to track.
 * @returns An {@link ActionStatus}  for each action provided.
 */
function useActionStatuses(action: AnyAction): ActionStatus
function useActionStatuses(actions: AnyAction[]): ActionStatus[]
function useActionStatuses(actions: AnyAction | AnyAction[]) {
  return useActionsStore(
    useShallow((state) => {
      if (!Array.isArray(actions)) {
        const action = actions
        return computeActionStatus(state, action)
      }

      const statuses = actions.map((action) =>
        computeActionStatus(state, action),
      )

      return statuses
    }),
  )
}

/**
 * Disables an action while it is initialized so it's not run twice.
 *
 * @param action - The action to begin preparing.
 */
const prepareActionArgs = async <T>(
  action: Action<T>,
  argsRequester: (() => Promise<T>) | (() => T),
): Promise<T> => {
  const store = useActionsStore.getState()
  const status = store.getActionStatus(action.id) ?? 'idle'

  if (status === 'running' || status === 'disabled') {
    throw new Error('Action is not ready')
  }

  store.setActionStatuses([{ id: action.id, status: 'disabled' }])

  try {
    const args = await argsRequester()
    return args
  } catch (e) {
    store.setActionStatuses([{ id: action.id, status: 'idle' }])
    throw e
  }
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
  const status = store.getActionStatus(action.id) ?? 'idle'

  if (status !== 'running') {
    const derived = action.derivedIds?.(args as T) ?? []

    const setAll = (status: ActionStatus | undefined) => {
      store.setActionStatuses([
        { id: action.id, status: status },
        ...derived.map((id) => ({ id, status })),
      ])
    }

    const setAllTimers = (timeout: number | undefined) => {
      store.setActionTimers([
        { id: action.id, timeoutId: timeout },
        ...derived.map((id) => ({ id, timeoutId: timeout })),
      ])
    }

    setAll('running')
    setAllTimers(undefined)

    return action
      .run(args as T)
      .then(() => {
        setAll('success')
      })
      .catch(() => {
        setAll('error')
      })
      .finally(() => {
        const timeoutId = setTimeout(() => {
          setAll(undefined)
        }, MS_IN_SECOND * 2)

        setAllTimers(timeoutId)
      })
  }
}

type AnyAction = Action<never>

/**
 * Utility function to get the icon to display for an action based on its status.
 */
const getActionGlyph = (action: AnyAction, status: ActionStatus): Glyph => {
  return match(status)
    .returnType<Glyph>()
    .with('idle', () => action.Glyph)
    .with('running', () => IconLoader2)
    .with('success', () => IconCheck)
    .with('error', () => IconAlertHexagonFilled)
    .with('disabled', () => action.Glyph)
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
    Array.isArray(actions) ? actions : [actions],
  )

  if (!Array.isArray(actions)) {
    const action = actions
    const status = actionStatuses.at(0) ?? 'idle'

    return {
      Glyph: getActionGlyph(action, status),
      label: action.label[status === 'disabled' ? 'idle' : status],
      actionStatus: status,
    }
  }

  return actions.map((action, index) => {
    const status = actionStatuses.at(index) ?? 'idle'

    return {
      Glyph: getActionGlyph(action, status),
      label: action.label[status === 'disabled' ? 'idle' : status],
      actionStatus: status,
    }
  })
}

/**
 * A hook that chooses the most relevant action from a list.
 *
 * @param actions - A list of actions to track.
 */
const useActiveAction = (actions: AnyAction[]): AnyAction | undefined => {
  const statuses = useActionStatuses(actions)

  const activeAction =
    actions.find((_, index) => statuses[index] === 'running') ??
    actions.find((_, index) => statuses[index] === 'error') ??
    actions.find((_, index) => statuses[index] === 'success')

  return activeAction
}

export {
  useActionStatuses,
  prepareActionArgs,
  runAction,
  useActionPresenters,
  useActiveAction,
  hashId,
}
export type { Action, AnyAction, ActionId, ActionStatus, ActionPresenter }
