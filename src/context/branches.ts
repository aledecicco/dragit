import { useEffect } from 'react'
import { usePrevious } from 'react-use'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import type { Reference } from '@/api/models'
import { useBranch, useCurrentRef } from '@/utils/repository'

import { useCurrentUpstream } from './upstream'

const MAX_BRANCHES = 50

// TODO: store persistence.
interface SelectedReferences {
  /**
   * The selected base used for comparison for each reference.
   */
  bases: Map<Reference, Reference | undefined>
}

interface Setters {
  /**
   * Change the selected base for a given reference.
   */
  changeBase: (reference: Reference, base: Reference | undefined) => void
}

const useSelectedRefsStore = create<SelectedReferences & Setters>()(
  immer((setState) => ({
    bases: new Map(),

    changeBase: (reference: Reference, base: Reference | undefined) => {
      setState((state) => {
        if (!base) {
          state.bases.delete(reference)
          return
        }

        const isNew = !state.bases.has(reference)
        if (isNew && state.bases.size >= MAX_BRANCHES) {
          const oldest = state.bases.keys().next().value
          if (oldest) {
            state.bases.delete(oldest)
          }
        }

        state.bases.delete(reference)
        state.bases.set(reference, base)
      })
    },
  })),
)

/**
 * Change the selected base for a given reference.
 */
const changeSelectedBase = useSelectedRefsStore.getState().changeBase

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
      return state.bases.get(reference)
    }),
  )

  return baseReference
}

/**
 * Hook that facilitates tracking the current reference and its selected base.
 *
 * @returns An object containing:
 * - `currentReference`: The currently checked-out reference.
 * - `baseReference`: The selected base reference for the current reference.
 */
const useSelectedReferences = () => {
  const currentReference = useCurrentRef()
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
  const currentReference = useCurrentRef()
  const currentUpstream = useCurrentUpstream()
  const prevReference = usePrevious(currentReference)

  useEffect(() => {
    if (!currentReference) {
      return
    }

    const store = useSelectedRefsStore.getState()

    let newBase: Reference | undefined =
      // First check if there's an override set in the store.
      store.bases.get(currentReference) ??
      // Otherwise, try to use the upstream of the branch as a base.
      (currentReference.type === 'branch' && currentUpstream
        ? {
            type: 'branch',
            refName: `${currentUpstream.remote}/${currentUpstream.remoteBranch}`,
          }
        : undefined)

    if (newBase && newBase.refName === currentReference.refName) {
      // If the new base collides with the current reference, try to fall back to the previous base.
      if (prevReference && prevReference.refName !== currentReference.refName) {
        newBase = prevReference
      } else {
        // Otherwise, clear the base.
        newBase = undefined
      }
    }

    store.changeBase(currentReference, newBase)
  }, [currentReference, prevReference, currentUpstream])
}

export {
  useSelectedBase,
  changeSelectedBase,
  useSelectedReferences,
  useSelectedBranches,
  useReferencesSync,
}
