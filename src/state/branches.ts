import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useEffectOnce } from 'react-use'
import { match } from 'ts-pattern'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import type {
  BranchInfo,
  Reference,
  RefName,
  TagInfo,
  Upstream,
} from '@/api/models'
import { setSettingsMutation } from '@/api/mutations/setSettings'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryTags } from '@/api/queries/tags'
import { getUpstreamReference, useHeadReference } from '@/utils/repository'

import { getSettings } from './settings'
import { useUpstreams } from './upstream'

interface SelectedReferences {
  /**
   * The selected base used for comparison for each reference.
   */
  bases: Map<RefName, Reference | null>
}

interface Setters {
  /**
   * Overrides the bases store for all branches.
   */
  setBases: (bases: Map<RefName, Reference | null>) => void

  /**
   * Change the selected base for a given reference.
   */
  changeBase: (reference: Reference, base: Reference | null | undefined) => void
}

const useSelectedRefsStore = create<SelectedReferences & Setters>()(
  immer((setState) => ({
    bases: new Map(),

    setBases: (bases) => {
      setState((state) => {
        state.bases = bases
      })
    },

    changeBase: (reference, base) => {
      setState((state) => {
        if (base === null) {
          state.bases.set(reference.refName, null)
          return
        }

        if (base === undefined) {
          state.bases.delete(reference.refName)
          return
        }

        state.bases.set(reference.refName, base)
      })
    },
  })),
)

/**
 * Figures out the default base to use for a given reference.
 */
const getDefaultBase = (
  reference: Reference,
  upstream: Upstream | undefined,
): Reference | undefined => {
  if (reference.type === 'branch' && !!upstream) {
    return getUpstreamReference(upstream)
  }

  return undefined
}

/**
 * Chooses a sensible base for a given reference.
 */
const chooseBase = (
  reference: Reference,
  upstream: Upstream | undefined,
  branches: BranchInfo[],
  tags: TagInfo[],
): Reference | null | undefined => {
  const store = useSelectedRefsStore.getState()
  const prevBase = store.bases.get(reference.refName)

  if (prevBase === null) {
    // The user explicitly chose to have no base for this reference.
    return null
  }

  let newBase: Reference | undefined =
    // First check if there's an override set in the store.
    prevBase ??
    // Otherwise find a default.
    getDefaultBase(reference, upstream)

  const baseIsValid = match(newBase)
    .with({ type: 'commit' }, () => true)
    .with(
      { type: 'branch' },
      (branchRef) =>
        // If the reference is a branch, it must exist in order to be used as a base.
        branches.some((branch) => branch.name === branchRef.refName) ||
        // But allow the upstream reference to be used as a base even if it's not in the list of branches.
        (!!upstream &&
          getUpstreamReference(upstream).refName === branchRef.refName),
    )
    .with({ type: 'tag' }, (tagRef) =>
      // If the reference is a tag, it must exist in order to be used as a base.
      tags.some((tag) => tag.name === tagRef.refName),
    )
    .with(undefined, () => true)
    .exhaustive()

  if (!baseIsValid) {
    newBase = undefined
  }

  if (newBase?.refName === prevBase?.refName) {
    return prevBase
  }

  return newBase
}

/**
 * Change the selected base for a given reference.
 */
const changeSelectedBase = (
  reference: Reference,
  newBase: Reference | null,
) => {
  const state = useSelectedRefsStore.getState()
  state.changeBase(reference, newBase)
}

/**
 * Hook that facilitates tracking the selected base for a reference.
 */
const useSelectedBase = (
  reference: Reference | undefined,
): Reference | undefined => {
  const storedBase = useSelectedRefsStore(
    useShallow((state) =>
      reference ? (state.bases.get(reference.refName) ?? undefined) : undefined,
    ),
  )

  return storedBase
}

/**
 * Hook that keeps the stored bases in sync when branches change.
 */
const useBasesSync = () => {
  const branchesQuery = useQueryBranches()
  const tagsQuery = useQueryTags()
  const upstreams = useUpstreams()
  const currentRef = useHeadReference()
  const saveSettings = useMutation(setSettingsMutation)

  useEffectOnce(() => {
    const store = useSelectedRefsStore.getState()
    const savedBases = getSettings().branchBases

    store.setBases(new Map(savedBases))
  })

  useEffect(() => {
    if (!branchesQuery.data || !tagsQuery.data) {
      return
    }

    const newBases = new Map<RefName, Reference | null>()

    for (const branch of branchesQuery.data) {
      const base = chooseBase(
        { type: 'branch', refName: branch.name },
        upstreams.get(branch.name),
        branchesQuery.data,
        tagsQuery.data,
      )

      if (base !== undefined) {
        newBases.set(branch.name, base)
      }
    }

    if (currentRef?.type === 'commit') {
      const base = chooseBase(
        currentRef,
        undefined,
        branchesQuery.data,
        tagsQuery.data,
      )

      if (base !== undefined) {
        newBases.set(currentRef.refName, base)
      }
    }

    const store = useSelectedRefsStore.getState()
    store.setBases(newBases)
  }, [branchesQuery.data, tagsQuery.data, currentRef, upstreams])

  const storedBases = useBases()
  useEffect(() => {
    if (storedBases.size > 0) {
      saveSettings.mutateAsync({
        settings: {
          branchBases: [...storedBases.entries()],
        },
      })
    }
  }, [storedBases, saveSettings.mutateAsync])
}

/**
 * Hook that returns the currently selected bases for all references.
 */
const useBases = () => {
  return useSelectedRefsStore(useShallow((state) => state.bases))
}

export { useBasesSync, useBases, changeSelectedBase, useSelectedBase }
