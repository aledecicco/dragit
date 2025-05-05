import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'
import { match } from 'ts-pattern'

import type { Reference } from '@api/models'
import { useQueryHeadInfo } from '@api/queries'

interface SelectedRefs {
  reference: Reference | undefined
  baseReference: Reference | undefined
}

const selectedRefs = new Store<SelectedRefs>({
  reference: undefined,
  baseReference: undefined,
})

const useSelectedRefs = () => useStore(selectedRefs)

const changeBaseRef = (baseReference: Reference | undefined) => {
  selectedRefs.setState((state) => ({
    ...state,
    baseReference,
  }))
}

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
