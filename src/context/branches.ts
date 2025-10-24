import { useEffect } from 'react'
import { Store, useStore } from '@tanstack/react-store'
import { match } from 'ts-pattern'

import type { Reference } from '@/api/models'
import { useQueryHeadInfo } from '@/api/queries/headInfo'

interface SelectedRefs {
  reference: Reference | undefined
  baseReference: Reference | undefined
}

const selectedRefs = new Store<SelectedRefs>({
  reference: undefined,
  baseReference: undefined,
})

/**
 * @returns An object containing:
 * - `reference`: The currently selected reference in the application.
 * - `baseReference`: The currently selected base reference for comparison in the application.
 */
const useSelectedRefs = () => useStore(selectedRefs)

/**
 * Selects a reference to compare the current one against.
 *
 * @param baseReference - The reference to select.
 */
const changeBaseRef = (baseReference: Reference | undefined) => {
  selectedRefs.setState((state) => ({
    ...state,
    baseReference,
  }))
}

/**
 * Hook that synchronizes the selected references with the current HEAD info.
 *
 * Can swap the base reference to avoid selecting the same one twice.
 */
const useReferencesSync = () => {
  const headInfoQuery = useQueryHeadInfo()

  useEffect(() => {
    const currentRef = match(headInfoQuery.data)
      .returnType<Reference | undefined>()
      .with({ type: 'branch' }, (reference) => ({
        type: 'branch',
        refName: reference.name,
      }))
      .with({ type: 'detached' }, (reference) => ({
        type: 'commit',
        refName: reference.commit,
      }))
      .with(undefined, () => undefined)
      .exhaustive()

    selectedRefs.setState((oldReferencees) => ({
      reference: currentRef,
      baseReference:
        oldReferencees.baseReference &&
        oldReferencees.baseReference.refName === currentRef?.refName
          ? oldReferencees.reference
          : oldReferencees.baseReference,
    }))
  }, [headInfoQuery.data])
}

export { useSelectedRefs, changeBaseRef, useReferencesSync, type SelectedRefs }
