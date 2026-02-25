import { useEffect } from 'react'
import { usePrevious } from 'react-use'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import type { Reference, RefName } from '@/api/models'
import { useBranch, useHeadReference } from '@/utils/repository'

import { getUpstreamReference, useSelectedUpstream } from './upstream'

const MAX_BRANCHES = 50

// TODO: store persistence.
interface SelectedReferences {
  /**
   * The currently selected reference.
   */
  current: Reference | null

  /**
   * The selected base used for comparison for each reference.
   */
  bases: Map<RefName, Reference | null>
}

interface Setters {
  /**
   * Change the currently selected reference.
   */
  changeCurrent: (reference: Reference | null) => void

  /**
   * Change the selected base for a given reference.
   */
  changeBase: (reference: Reference, base: Reference | null) => void
}

const useSelectedRefsStore = create<SelectedReferences & Setters>()(
  immer((setState) => ({
    current: null,

    bases: new Map(),

    changeCurrent: (reference: Reference | null) => {
      setState((state) => {
        if (state.current?.refName === reference?.refName) {
          return
        }

        state.current = reference
      })
    },

    changeBase: (reference: Reference, base: Reference | null) => {
      setState((state) => {
        if (state.bases.get(reference.refName)?.refName === base?.refName) {
          return
        }

        if (base === null) {
          state.bases.set(reference.refName, null)
          return
        }

        const isNew = !state.bases.has(reference.refName)
        if (isNew && state.bases.size >= MAX_BRANCHES) {
          const oldest = state.bases.keys().next().value
          if (oldest) {
            state.bases.delete(oldest)
          }
        }

        state.bases.delete(reference.refName)
        state.bases.set(reference.refName, base)
      })
    },
  })),
)

/**
 * Hook that facilitates tracking the currently checked-out reference.
 */
const useCurrentReference = (): Reference | undefined => {
  const currentReference = useSelectedRefsStore(
    useShallow((state) => {
      return state.current ?? undefined
    }),
  )

  return currentReference
}

/**
 * Change the selected base for a given reference.
 */
const changeSelectedBase = (
  reference: Reference,
  newBase: Reference | null,
) => {
  const state = useSelectedRefsStore.getState()

  if (reference.refName !== newBase?.refName) {
    state.changeBase(reference, newBase)
  }
}

/**
 * Hook that facilitates tracking the selected base for a reference.
 */
const useSelectedBase = (
  reference: Reference | undefined,
): Reference | undefined => {
  const baseReference = useSelectedRefsStore(
    useShallow((state) => {
      if (!reference) {
        return undefined
      }

      return state.bases.get(reference.refName)
    }),
  )

  return baseReference ?? undefined
}

/**
 * Hook that facilitates tracking the current reference and its selected base.
 *
 * @returns An object containing:
 * - `currentReference`: The currently checked-out reference.
 * - `baseReference`: The selected base reference for that current reference.
 */
const useSelectedReferences = () => {
  const currentReference = useCurrentReference()
  const baseReference = useSelectedBase(currentReference)

  return {
    currentReference,
    baseReference,
  }
}

/**
 * Hook that facilitates tracking the current reference and its selected base,
 * evaluating them to branches if possible.
 *
 * @returns An object containing:
 * - `currentBranch`: The branch pointed at by the currently checked-out reference, if any.
 * - `baseBranch`: The branch pointed at by the selected base reference, if any.
 */
const useSelectedBranches = () => {
  const { currentReference, baseReference } = useSelectedReferences()
  const currentBranch = useBranch(currentReference)
  const baseBranch = useBranch(baseReference)

  return {
    currentBranch,
    baseBranch,
  }
}

/**
 * Hook that synchronizes the selected base when the checked out reference changes.
 *
 * Chooses sensible defaults when there is no base set.
 */
const useReferencesSync = () => {
  const headReference = useHeadReference()
  const branch = useBranch(headReference)
  const currentUpstream = useSelectedUpstream(branch)
  const prevReference = usePrevious(headReference)
  const baseReference = useSelectedBase(prevReference)

  useEffect(() => {
    const store = useSelectedRefsStore.getState()

    if (store.current?.refName !== headReference?.refName) {
      store.changeCurrent(headReference ?? null)
    }

    if (!headReference) {
      return
    }

    const storedBase = store.bases.get(headReference.refName)

    let newBase: Reference | null | undefined =
      // First check if there's an override set in the store.
      storedBase !== undefined
        ? storedBase
        : // Otherwise, try to use the upstream of the branch as a base.
          headReference.type === 'branch' && currentUpstream
          ? getUpstreamReference(currentUpstream)
          : undefined

    if (baseReference && baseReference.refName === headReference.refName) {
      // If the new reference collides with the current base, try to fall back to the previous reference.
      if (prevReference && prevReference.refName !== headReference.refName) {
        newBase = prevReference
      } else {
        // Otherwise, clear the base.
        newBase = undefined
      }
    }

    if (newBase !== undefined && storedBase?.refName !== newBase?.refName) {
      store.changeBase(headReference, newBase)
    }
  }, [headReference, prevReference, baseReference, currentUpstream])
}

export {
  changeSelectedBase,
  useSelectedReferences,
  useSelectedBranches,
  useReferencesSync,
}
